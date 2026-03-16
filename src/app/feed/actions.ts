'use server'

import type { User } from '@/../generated/prisma/client'
import { ensurePinataGroup } from '@/api/pinata/create-group'
import { createRateLimiter } from '@/lib/rate-limit'
import { requireAuth } from '@/lib/require-auth'
import {
  createAnnouncementSchema,
  createPostSchema,
  getAnnouncementsSchema,
  getPostsByBadgeSchema,
  getPostsSchema,
} from '@/lib/schemas'
import { prisma } from '@/prisma-client'

const postLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })
const announcementLimiter = createRateLimiter({ windowMs: 60_000, max: 5 })

type CreatePostProps = {
  content: string
  badgeSymbol?: string[]
  mention?: string[]
  parentId?: string
  organization?: string
  onChainPostId?: string
}

export async function createPost(input: CreatePostProps) {
  try {
    const actor = await requireAuth()
    const {
      content,
      badgeSymbol,
      mention,
      parentId,
      organization,
      onChainPostId,
    } = createPostSchema.parse(input)

    const limit = postLimiter.check(actor)
    if (!limit.ok) {
      return { success: false, error: 'Rate limit exceeded' }
    }

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

    const post = await prisma.post.create({
      data: {
        content,
        badgeSymbol,
        organization: inheritedOrganization,
        onChainPostId: onChainPostId ? BigInt(onChainPostId) : null,
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
      postId: post.id,
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { success: false, error: 'Unauthorized' }
    }
    console.error('Error creating post:', error)
    return {
      success: false,
      error: 'Failed to create post',
    }
  }
}

type CreateAnnouncementProps = {
  content: string
  organization: string
  onChainPostId?: string
}

export async function createAnnouncement(input: CreateAnnouncementProps) {
  try {
    const actor = await requireAuth()
    const { content, organization, onChainPostId } =
      createAnnouncementSchema.parse(input)

    const limit = announcementLimiter.check(actor)
    if (!limit.ok) {
      return { success: false, error: 'Rate limit exceeded' }
    }

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

    const post = await prisma.post.create({
      data: {
        content,
        organization,
        isAnnouncement: true,
        onChainPostId: onChainPostId ? BigInt(onChainPostId) : null,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return {
      success: true,
      postId: post.id,
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { success: false, error: 'Unauthorized' }
    }
    console.error('Error creating announcement:', error)
    return {
      success: false,
      error: 'Failed to create announcement',
    }
  }
}

type GetAnnouncementsProps = {
  cursor?: string
  limit: number
  orderBy: 'asc' | 'desc'
  organization: string
}

export async function getAnnouncements(input: GetAnnouncementsProps) {
  try {
    const { cursor, limit, orderBy, organization } =
      getAnnouncementsSchema.parse(input)

    const posts = await prisma.post.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        parentId: null,
        isAnnouncement: true,
        organization,
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
        beamGives: {
          select: {
            badgeSymbol: true,
            parAmount: true,
            upaEmitted: true,
            gpaEmitted: true,
            rpaEmitted: true,
            trackingDeltas: true,
            deltaScore: true,
          },
        },
        children: {
          include: {
            user: true,
            beamGives: {
              select: {
                badgeSymbol: true,
                parAmount: true,
                upaEmitted: true,
                gpaEmitted: true,
                rpaEmitted: true,
                trackingDeltas: true,
                deltaScore: true,
              },
            },
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
    console.error('Error fetching announcements:', error)
    return {
      success: false,
      error: 'Failed to fetch announcements',
    }
  }
}

type GetPostsByBadgeProps = {
  badgeSymbol: string
  limit?: number
}

export async function getPostsByBadge(input: GetPostsByBadgeProps) {
  const { badgeSymbol, limit = 10 } = getPostsByBadgeSchema.parse(input)

  // Direct match: posts where badgeSymbol array contains this symbol
  const posts = await prisma.post.findMany({
    take: limit,
    where: {
      badgeSymbol: { has: badgeSymbol },
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (posts.length > 0) return posts

  // Fallback: tracking badges are stored in BeamGive.trackingDeltas JSON
  // Badge symbol format is "0,SYMB" — extract the symbol name
  const symbolName = badgeSymbol.includes(',')
    ? badgeSymbol.split(',')[1]
    : badgeSymbol

  // Also check if the badge was directly given as a beam
  const beamGives = await prisma.beamGive.findMany({
    take: limit,
    where: {
      OR: [
        { badgeSymbol },
        {
          trackingDeltas: {
            path: [symbolName],
            gt: 0,
          },
        },
      ],
    },
    include: {
      post: {
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
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Deduplicate by post ID
  const seen = new Set<string>()
  return beamGives
    .map((bg) => bg.post)
    .filter((post) => {
      if (seen.has(post.id)) return false
      seen.add(post.id)
      return true
    })
}

type GetPostsProps = {
  cursor?: string
  limit: number
  orderBy: 'asc' | 'desc'
  organizations?: string[]
  actor?: string
}

export async function getPosts(input: GetPostsProps) {
  try {
    const { cursor, limit, orderBy, organizations, actor } =
      getPostsSchema.parse(input)

    const posts = await prisma.post.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        parentId: null,
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
        beamGives: {
          select: {
            badgeSymbol: true,
            parAmount: true,
            upaEmitted: true,
            gpaEmitted: true,
            rpaEmitted: true,
            trackingDeltas: true,
            deltaScore: true,
          },
        },
        children: {
          include: {
            user: true,
            beamGives: {
              select: {
                badgeSymbol: true,
                parAmount: true,
                upaEmitted: true,
                gpaEmitted: true,
                rpaEmitted: true,
                trackingDeltas: true,
                deltaScore: true,
              },
            },
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
