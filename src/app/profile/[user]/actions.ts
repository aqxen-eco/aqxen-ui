'use server'

import { ensurePinataGroup } from '@/api/pinata/create-group'
import { requireAuth } from '@/lib/require-auth'
import { updateProfileSchema } from '@/lib/schemas'
import { prisma } from '@/prisma-client'

type UpdateProfileProps = {
  name?: string
  about?: string
  location?: string
  interests?: string
  avatarIpfs?: string
  coverIpfs?: string
}

export async function ensureProfilePinataGroup() {
  const actor = await requireAuth()
  return await ensurePinataGroup(actor)
}

export async function updateProfile(input: UpdateProfileProps) {
  const actor = await requireAuth()
  const { name, about, location, interests, avatarIpfs, coverIpfs } =
    updateProfileSchema.parse(input)

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
