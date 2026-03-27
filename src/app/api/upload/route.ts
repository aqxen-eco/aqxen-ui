import { NextResponse } from 'next/server'

import { ensurePinataGroupByName } from '@/api/pinata/create-group'
import { getPinataClient } from '@/lib/pinata-client'
import { createRateLimiter } from '@/lib/rate-limit'
import { getSession } from '@/lib/session'
import { prisma } from '@/prisma-client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const uploadLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })

async function getUploadName(
  actor: string,
  variant: 'avatar' | 'cover'
): Promise<string | null> {
  try {
    if (variant === 'avatar') {
      const user = await prisma.user.update({
        where: { actor },
        data: { avatarUploadCount: { increment: 1 } },
        select: { avatarUploadCount: true },
      })
      return `${actor}-avatar-${user.avatarUploadCount}`
    }

    const user = await prisma.user.update({
      where: { actor },
      data: { coverUploadCount: { increment: 1 } },
      select: { coverUploadCount: true },
    })
    return `${actor}-cover-${user.coverUploadCount}`
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const actor = session.actor

  const limit = uploadLimiter.check(actor)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 },
    )
  }

  const jwt = process.env.PINATA_JWT
  if (!jwt) {
    return NextResponse.json(
      { error: 'PINATA_JWT not configured' },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: jpeg, png, gif, webp' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File too large. Max 5MB' },
      { status: 400 }
    )
  }

  const groupId = formData.get('groupId')
  const variant = formData.get('variant')
  const groupName = formData.get('groupName')
  const clientUploadName = formData.get('uploadName')

  let uploadName: string | null =
    clientUploadName && typeof clientUploadName === 'string'
      ? clientUploadName
      : null
  let resolvedGroupId = groupId && typeof groupId === 'string' ? groupId : null

  if (
    variant &&
    (variant === 'avatar' || variant === 'cover')
  ) {
    uploadName = await getUploadName(actor, variant)
  }

  if (groupName && typeof groupName === 'string' && !resolvedGroupId) {
    resolvedGroupId = await ensurePinataGroupByName(groupName)

    if (resolvedGroupId && !uploadName) {
      const record = await prisma.pinataGroup.update({
        where: { name: groupName },
        data: { uploadCount: { increment: 1 } },
        select: { uploadCount: true },
      })
      uploadName = `${groupName}-${record.uploadCount}`
    }
  }

  const pinataForm = new FormData()
  pinataForm.append('file', file)
  pinataForm.append('network', 'public')

  if (uploadName) {
    pinataForm.append('name', uploadName)
  }

  if (resolvedGroupId) {
    pinataForm.append('group_id', resolvedGroupId)
  }

  const response = await fetch(
    'https://uploads.pinata.cloud/v3/files',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: pinataForm,
    }
  )

  if (!response.ok) {
    let errorBody: string | undefined
    let duplicateCid: string | undefined

    try {
      errorBody = await response.text()
      const parsed = JSON.parse(errorBody)
      duplicateCid = parsed?.data?.cid
    } catch {
      // body wasn't JSON, keep the raw text for logging
    }

    if (duplicateCid) {
      return NextResponse.json({ ipfsHash: duplicateCid })
    }

    console.error('Pinata upload failed: status %d', response.status)
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 502 },
    )
  }

  const data = await response.json()
  const fileId = data.data?.id
  const cid = data.data?.cid

  if (resolvedGroupId && fileId && !data.data?.group_id) {
    try {
      const pinata = getPinataClient()
      await pinata.groups.public.addFiles({
        groupId: resolvedGroupId,
        files: [fileId],
      })
    } catch {
      console.error('Failed to add file to Pinata group')
    }
  }

  return NextResponse.json({ ipfsHash: cid })
}
