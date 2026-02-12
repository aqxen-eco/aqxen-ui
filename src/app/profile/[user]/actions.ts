'use server'

import { ensurePinataGroup } from '@/api/pinata/create-group'
import { prisma } from '@/prisma-client'

type UpdateProfileProps = {
  actor: string
  name?: string
  about?: string
  location?: string
  interests?: string
  avatarIpfs?: string
  coverIpfs?: string
}

export async function ensureProfilePinataGroup(actor: string) {
  return await ensurePinataGroup(actor)
}

export async function updateProfile({
  actor,
  name,
  about,
  location,
  interests,
  avatarIpfs,
  coverIpfs,
}: UpdateProfileProps) {
  const pinataGroupId = await ensurePinataGroup(actor)

  return await prisma.user.upsert({
    where: { actor },
    update: {
      name,
      about,
      location,
      interests,
      avatarIpfs,
      coverIpfs,
      ...(pinataGroupId ? { pinataGroupId } : {}),
    },
    create: {
      actor,
      name,
      about,
      location,
      interests,
      avatarIpfs,
      coverIpfs,
      pinataGroupId,
    },
  })
}
