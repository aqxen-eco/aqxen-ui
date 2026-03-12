'use server'

import { createRateLimiter } from '@/lib/rate-limit'
import { requireAuth } from '@/lib/require-auth'
import { processBeamGiveSchema } from '@/lib/schemas'
import { prisma } from '@/prisma-client'

const beamGiveLimiter = createRateLimiter({ windowMs: 60_000, max: 30 })

type ProcessBeamGiveProps = {
  postId: string
  recipientActor: string
  badgeSymbol: string
  trackingDeltas: Record<string, number>
  deltaScore: number
  orgAccount: string
}

export async function processBeamGive(input: ProcessBeamGiveProps) {
  const giverActor = await requireAuth()
  const {
    postId,
    recipientActor,
    badgeSymbol,
    trackingDeltas,
    deltaScore,
    orgAccount,
  } = processBeamGiveSchema.parse(input)

  const limit = beamGiveLimiter.check(giverActor)
  if (!limit.ok) {
    throw new Error('Rate limit exceeded')
  }

  // 1. Store BeamGive record with on-chain deltas
  await prisma.beamGive.create({
    data: {
      postId,
      giverActor,
      recipientActor,
      badgeSymbol,
      orgAccount,
      trackingDeltas,
      deltaScore,
    },
  })

  // 2. Update child post totalScore
  await prisma.post.update({
    where: { id: postId },
    data: {
      totalScore: { increment: deltaScore },
    },
  })

  // 3. Re-aggregate parent post totalScore from all children
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { parentId: true },
  })

  if (post?.parentId) {
    const childrenAgg = await prisma.post.aggregate({
      where: { parentId: post.parentId },
      _sum: { totalScore: true },
    })

    await prisma.post.update({
      where: { id: post.parentId },
      data: {
        totalScore: childrenAgg._sum.totalScore ?? 0,
      },
    })
  }

  // 4. Upsert UserReputationScore for recipient + org
  await prisma.userReputationScore.upsert({
    where: {
      userActor_orgAccount: {
        userActor: recipientActor,
        orgAccount,
      },
    },
    create: {
      userActor: recipientActor,
      orgAccount,
      totalScore: deltaScore,
    },
    update: {
      totalScore: { increment: deltaScore },
    },
  })

  return { deltaScore, trackingDeltas }
}
