/**
 * One-time migration script to recompute reputation scores from BeamGive
 * records. Fixes data where deltaScore was recorded as 0 due to API
 * read-after-write timing on mainnet.
 *
 * What it does:
 *   1. Recomputes each post's totalScore from its BeamGive records
 *   2. Recomputes each parent post's totalScore from its children
 *   3. Recomputes each UserReputationScore from BeamGive records
 *
 * Run:  npx tsx scripts/recompute-reputation.ts
 */

import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  // --- 1. Recompute post totalScore from BeamGive deltaScore sums ---

  const postScores = await prisma.beamGive.groupBy({
    by: ['postId'],
    _sum: { deltaScore: true },
  })

  console.log(`Updating totalScore on ${postScores.length} posts (from BeamGive sums)...`)

  for (const row of postScores) {
    const newScore = row._sum.deltaScore ?? 0
    await prisma.post.update({
      where: { id: row.postId },
      data: { totalScore: newScore },
    })
  }

  // --- 2. Recompute parent post totalScore from children ---

  const parentPosts = await prisma.post.findMany({
    where: {
      children: { some: {} },
    },
    select: { id: true },
  })

  console.log(`Re-aggregating totalScore on ${parentPosts.length} parent posts...`)

  for (const parent of parentPosts) {
    const agg = await prisma.post.aggregate({
      where: { parentId: parent.id },
      _sum: { totalScore: true },
    })

    await prisma.post.update({
      where: { id: parent.id },
      data: { totalScore: agg._sum.totalScore ?? 0 },
    })
  }

  // --- 3. Recompute UserReputationScore from BeamGive records ---

  const reputationScores = await prisma.beamGive.groupBy({
    by: ['recipientActor', 'orgAccount'],
    _sum: { deltaScore: true },
  })

  console.log(`Upserting ${reputationScores.length} UserReputationScore rows...`)

  for (const row of reputationScores) {
    const newScore = row._sum.deltaScore ?? 0
    await prisma.userReputationScore.upsert({
      where: {
        userActor_orgAccount: {
          userActor: row.recipientActor,
          orgAccount: row.orgAccount,
        },
      },
      create: {
        userActor: row.recipientActor,
        orgAccount: row.orgAccount,
        totalScore: newScore,
      },
      update: {
        totalScore: newScore,
      },
    })
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
