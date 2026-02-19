'use server'

import { listBadgeAutomation } from '@/api/chain/badge-automation/list-badge-automation'
import type { BeamMetadata } from '@/api/chain/beams/list-beam-metadata'
import { listBeamMetadata } from '@/api/chain/beams/list-beam-metadata'
import type { BadgeAutomation } from '@/api/model/badge-automation'
import { prisma } from '@/prisma-client'

// --- Cache helpers (5 min TTL) ---

const CACHE_TTL = 5 * 60 * 1000

type CacheEntry<T> = { data: T; ts: number }

const beamMetadataCache = new Map<string, CacheEntry<BeamMetadata[]>>()
const automationCache = new Map<string, CacheEntry<BadgeAutomation[]>>()

async function getCachedBeamMetadata(org: string): Promise<BeamMetadata[]> {
  const cached = beamMetadataCache.get(org)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const rows = await listBeamMetadata({ scope: org })
  beamMetadataCache.set(org, { data: rows, ts: Date.now() })
  return rows
}

async function getCachedAutomations(
  org: string,
): Promise<BadgeAutomation[]> {
  const cached = automationCache.get(org)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const result = await listBadgeAutomation({ scope: org })
  automationCache.set(org, { data: result.rows, ts: Date.now() })
  return result.rows
}

// --- Main function ---

type ProcessBeamGiveProps = {
  postId: string
  giverActor: string
  recipientActor: string
  badgeSymbol: string
  amount: number
  orgAccount: string
}

export async function processBeamGive({
  postId,
  giverActor,
  recipientActor,
  badgeSymbol,
  amount,
  orgAccount,
}: ProcessBeamGiveProps) {
  // 1. PAR = amount
  const par = amount

  // 2. UPA (uniqueness)
  let upa = 0
  try {
    await prisma.uniqueGiver.create({
      data: { recipientActor, giverActor },
    })
    upa = 1
  } catch {
    // unique constraint violation → repeat giver
    upa = 0
  }

  // 3. GPA (giver rep)
  let gpa = 0
  const giverTotals = await prisma.userEmissionTotal.aggregate({
    where: { userActor: giverActor },
    _sum: { rpaEmittedTotal: true },
  })
  const giverRpa = giverTotals._sum.rpaEmittedTotal ?? 0

  if (giverRpa > 0) {
    const globalTotals = await prisma.userEmissionTotal.aggregate({
      _sum: { rpaEmittedTotal: true },
    })
    const activeUsers = await prisma.userEmissionTotal.count({
      where: { rpaEmittedTotal: { gt: 0 } },
    })

    const globalRpa = globalTotals._sum.rpaEmittedTotal ?? 0
    const avgRpa = activeUsers > 0 ? globalRpa / activeUsers : 0

    gpa = avgRpa > 0 ? Math.max(1, (giverRpa * 100) / avgRpa) : 1
  }

  // 4. XYZ (seasonal uniqueness)
  let xyz = 0
  const beamMetadataRows = await getCachedBeamMetadata(orgAccount)
  const beamMeta = beamMetadataRows.find(
    (m) => m.badge_symbol === badgeSymbol,
  )

  if (beamMeta) {
    const startMs = new Date(`${beamMeta.starttime}Z`).getTime()
    const cycleLenMs = beamMeta.cycle_length * 1000
    const currentCycle = Math.floor((Date.now() - startMs) / cycleLenMs)
    const seasonId = `${badgeSymbol}_cycle_${currentCycle}`

    try {
      await prisma.seasonUniqueGiver.create({
        data: { recipientActor, giverActor, seasonId },
      })
      xyz = 1
    } catch {
      // unique constraint violation → repeat giver this season
      xyz = 0
    }
  }

  // 5. RPA (andemitter threshold emission)
  const emissionTotals = await prisma.userEmissionTotal.upsert({
    where: {
      userActor_orgAccount_beamBadgeSymbol: {
        userActor: recipientActor,
        orgAccount,
        beamBadgeSymbol: badgeSymbol,
      },
    },
    create: {
      userActor: recipientActor,
      orgAccount,
      beamBadgeSymbol: badgeSymbol,
      parTotal: par,
      upaTotal: upa,
      gpaTotal: gpa,
      xyzTotal: xyz,
      rpaEmittedTotal: 0,
    },
    update: {
      parTotal: { increment: par },
      upaTotal: { increment: upa },
      gpaTotal: { increment: gpa },
      xyzTotal: { increment: xyz },
    },
  })

  const newParTotal = emissionTotals.parTotal
  const newUpaTotal = emissionTotals.upaTotal
  const newGpaTotal = emissionTotals.gpaTotal
  const newXyzTotal = emissionTotals.xyzTotal
  const oldRpaEmitted = emissionTotals.rpaEmittedTotal

  let rpa = 0
  const automations = await getCachedAutomations(orgAccount)

  // Find the andemitter that targets RPA for this beam
  const rpaEmitter = automations.find((a) => {
    if (a.status !== 'activate') return false
    return a.emitter_criteria.some(
      (c) => c.key === badgeSymbol || c.value === badgeSymbol,
    )
  })

  if (rpaEmitter) {
    // Parse thresholds from emitter_criteria
    const thresholds: Record<string, number> = {}
    for (const criterion of rpaEmitter.emitter_criteria) {
      // key = badge symbol, value = threshold amount (e.g. "1 PAR")
      const parts = criterion.value.split(' ')
      const threshold = parseFloat(parts[0])
      if (!isNaN(threshold)) {
        thresholds[criterion.key] = threshold
      }
    }

    // Calculate how many total RPA should have been emitted
    let newTotalRpa = 0
    for (const [key, threshold] of Object.entries(thresholds)) {
      if (threshold <= 0) continue
      if (key === badgeSymbol) {
        newTotalRpa += Math.floor(newParTotal / threshold)
      } else if (key.endsWith('UPA') || key.includes('Uniqueness')) {
        newTotalRpa += Math.floor(newUpaTotal / threshold)
      } else if (key.endsWith('GPA') || key.includes('Rep')) {
        newTotalRpa += Math.floor(newGpaTotal / threshold)
      } else if (key.endsWith('XYZ') || key.includes('Bounded')) {
        newTotalRpa += Math.floor(newXyzTotal / threshold)
      }
    }

    rpa = newTotalRpa - oldRpaEmitted

    if (rpa > 0) {
      await prisma.userEmissionTotal.update({
        where: { id: emissionTotals.id },
        data: { rpaEmittedTotal: newTotalRpa },
      })
    }
  }

  // 6. Store BeamGive record
  await prisma.beamGive.create({
    data: {
      postId,
      giverActor,
      recipientActor,
      badgeSymbol,
      orgAccount,
      parAmount: par,
      upaEmitted: upa,
      gpaEmitted: gpa,
      xyzEmitted: xyz,
      rpaEmitted: rpa,
    },
  })

  // 7. Update child post scores
  const totalScore = par + upa + gpa + rpa
  await prisma.post.update({
    where: { id: postId },
    data: {
      parScore: { increment: par },
      upaScore: { increment: upa },
      gpaScore: { increment: gpa },
      rpaScore: { increment: rpa },
      totalScore: { increment: totalScore },
    },
  })

  // 8. Update parent post score (sum of all children)
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { parentId: true },
  })

  if (post?.parentId) {
    const childrenAgg = await prisma.post.aggregate({
      where: { parentId: post.parentId },
      _sum: {
        parScore: true,
        upaScore: true,
        gpaScore: true,
        rpaScore: true,
        totalScore: true,
      },
    })

    await prisma.post.update({
      where: { id: post.parentId },
      data: {
        parScore: childrenAgg._sum.parScore ?? 0,
        upaScore: childrenAgg._sum.upaScore ?? 0,
        gpaScore: childrenAgg._sum.gpaScore ?? 0,
        rpaScore: childrenAgg._sum.rpaScore ?? 0,
        totalScore: childrenAgg._sum.totalScore ?? 0,
      },
    })
  }

  // 9. Upsert UserReputationScore for recipient + org
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
      parScore: par,
      upaScore: upa,
      gpaScore: gpa,
      rpaScore: rpa,
      totalScore,
    },
    update: {
      parScore: { increment: par },
      upaScore: { increment: upa },
      gpaScore: { increment: gpa },
      rpaScore: { increment: rpa },
      totalScore: { increment: totalScore },
    },
  })

  return { par, upa, gpa, xyz, rpa, totalScore }
}
