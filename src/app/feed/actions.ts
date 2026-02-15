'use server'

import type { User } from '@/../generated/prisma/client'
import { ensurePinataGroup } from '@/api/pinata/create-group'
import { prisma } from '@/prisma-client'

type CreatePostProps = {
  actor: string
  content: string
  badgeSymbol?: string[]
  mention?: string[]
  parentId?: string
  organization?: string
}

export async function createPost({
  actor,
  content,
  badgeSymbol,
  mention,
  parentId,
  organization,
}: CreatePostProps) {
  try {
    const authorGroupId = await ensurePinataGroup(actor)

    const user = await prisma.user.upsert({
      where: { actor },
      update: {
        ...(authorGroupId ? { pinataGroupId: authorGroupId } : {}),
      },
      create: {
        actor,
        pinataGroupId: authorGroupId,
      },
    })

    let relatedPost = {}
    let inheritedOrganization = organization
    if (parentId) {
      relatedPost = {
        parent: {
          connect: {
            id: parentId,
          },
        },
      }

      if (!inheritedOrganization) {
        const parentPost = await prisma.post.findUnique({
          where: { id: parentId },
          select: { organization: true },
        })
        inheritedOrganization = parentPost?.organization ?? undefined
      }
    }

    let relatedMention = {}
    if (mention && mention.length > 0) {
      const mentionGroupIds = new Map<string, string | null>()
      await Promise.all(
        mention.map(async (actorMention) => {
          const groupId = await ensurePinataGroup(actorMention)
          mentionGroupIds.set(actorMention, groupId)
        })
      )

      const userMention: User[] = await prisma.$transaction(
        mention.map((actorMention) => {
          const groupId = mentionGroupIds.get(actorMention)
          return prisma.user.upsert({
            where: { actor: actorMention },
            update: {
              ...(groupId ? { pinataGroupId: groupId } : {}),
            },
            create: {
              actor: actorMention,
              pinataGroupId: groupId,
            },
          })
        })
      )

      relatedMention = {
        mention: {
          create: userMention.map((user) => ({ userId: user.id })),
        },
      }
    }

    await prisma.post.create({
      data: {
        content,
        badgeSymbol,
        organization: inheritedOrganization,
        user: {
          connect: {
            id: user.id,
          },
        },
        ...relatedPost,
        ...relatedMention,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error creating post:', error)
    return {
      success: false,
      error: 'Failed to create post',
    }
  }
}

type GetPostsProps = {
  cursor?: string
  limit: number
  orderBy: 'asc' | 'desc'
  organizations?: string[]
  actor?: string
}

export async function getPosts({
  cursor,
  limit,
  orderBy,
  organizations,
  actor,
}: GetPostsProps) {
  try {
    const posts = await prisma.post.findMany({
      take: limit,
      skip: cursor ? 1 : 0, // Skip the cursor if provided
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        parentId: null, // Filters only posts that are not comments
        ...(organizations ? { organization: { in: organizations } } : {}),
        ...(actor ? { user: { actor } } : {}),
      },
      include: {
        user: true,
        mention: {
          include: {
            user: {
              select: {
                actor: true,
              },
            },
          },
        },
        children: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: orderBy,
      },
    })

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].id : null

    return {
      success: true,
      posts,
      nextCursor,
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return {
      success: false,
      error: 'Failed to fetch posts',
    }
  }
}
