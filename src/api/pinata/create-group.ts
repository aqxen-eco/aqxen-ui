import { getPinataClient } from '@/lib/pinata-client'
import { prisma } from '@/prisma-client'

export async function createPinataGroup(
  name: string
): Promise<string | null> {
  try {
    const pinata = getPinataClient()
    const group = await pinata.groups.public.create({ name })
    return group.id ?? null
  } catch (error) {
    console.error('Error creating Pinata group:', error)
    return null
  }
}

export async function ensurePinataGroup(
  actor: string
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { actor },
      select: { pinataGroupId: true },
    })

    if (user?.pinataGroupId) {
      return user.pinataGroupId
    }

    const groupId = await createPinataGroup(`user-${actor}`)
    if (!groupId) return null

    if (user) {
      await prisma.user.update({
        where: { actor },
        data: { pinataGroupId: groupId },
      })
    }

    return groupId
  } catch (error) {
    console.error('Error ensuring Pinata group:', error)
    return null
  }
}

export async function ensurePinataGroupByName(
  name: string
): Promise<string | null> {
  try {
    const existing = await prisma.pinataGroup.findUnique({
      where: { name },
      select: { pinataGroupId: true },
    })

    if (existing) return existing.pinataGroupId

    const groupId = await createPinataGroup(name)
    if (!groupId) return null

    await prisma.pinataGroup.create({
      data: { name, pinataGroupId: groupId },
    })

    return groupId
  } catch (error) {
    console.error('Error ensuring Pinata group by name:', error)
    return null
  }
}
