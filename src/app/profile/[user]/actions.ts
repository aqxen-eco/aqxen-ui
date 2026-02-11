'use server'

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

export async function updateProfile({
  actor,
  name,
  about,
  location,
  interests,
  avatarIpfs,
  coverIpfs,
}: UpdateProfileProps) {
  return await prisma.user.upsert({
    where: { actor },
    update: {
      name,
      about,
      location,
      interests,
      avatarIpfs,
      coverIpfs,
    },
    create: {
      actor,
      name,
      about,
      location,
      interests,
      avatarIpfs,
      coverIpfs,
    },
  })
}
