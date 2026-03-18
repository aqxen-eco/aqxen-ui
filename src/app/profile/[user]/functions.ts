'use server'

import { listBadge } from '@/api/chain/badge/list-badge'
import { listBadgeStatus } from '@/api/chain/badge/list-badge-status'
import { listLifetimeBadge } from '@/api/chain/badge/list-lifetime-badge'
import { listSeasonalBadge } from '@/api/chain/badge/list-seasonal-badge'
import { listBeamMetadata } from '@/api/chain/beams/list-beam-metadata'
import { listBeamTemplates } from '@/api/chain/beams/list-beam-templates'
import { listMembers } from '@/api/chain/organization/list-members'
import { listOrganization } from '@/api/chain/organization/list-organization'
import { listSeason } from '@/api/chain/season/list-season'
import { listSeries } from '@/api/chain/series/list-series'
import { type Badge, BadgeStatus } from '@/api/model/badge'
import { type Organization } from '@/api/model/organization'
import { type Season } from '@/api/model/season'
import { type Series } from '@/api/model/series'
import { prisma } from '@/prisma-client'

type GetUserBadgesProps = {
  user: string
}

type LifetimeBadges = {
  balance: number
  orgName: string
  orgIpfsImage: string
  orgAccountName: string
} & Badge

type SeasonSeriesBadges = {
  series: (Series & { badges: ({ balance: number } & Badge)[] })[]
  orgDisplayName: string
  orgIpfsImage: string
  orgAccountName: string
} & Season

type GetUserBadges = {
  badges: LifetimeBadges[]
  seasons: SeasonSeriesBadges[]
  beamBadges: LifetimeBadges[]
  beamSeasons: SeasonSeriesBadges[]
}

export async function getUserBadges({
  user,
}: GetUserBadgesProps): Promise<GetUserBadges> {
  // Step 1: Fetch user-scoped data and all organizations
  const [
    { rows: organization },
    { rows: lifetimeBadges },
    { rows: seasonalBadges },
    beamTemplates,
  ] = await Promise.all([
    listOrganization({}),
    listLifetimeBadge({ scope: user }),
    listSeasonalBadge({ scope: user }),
    listBeamTemplates(),
  ])

  // Step 2: Determine relevant orgs from lifetime badge symbols
  const relevantOrgNames = new Set<string>()
  organization.forEach((org) => {
    lifetimeBadges.forEach((userBadge) => {
      const symbol = userBadge.balance.split(' ')[1].toLowerCase()
      const orgCode = org.org_code.toLowerCase()
      if (symbol.startsWith(orgCode)) {
        relevantOrgNames.add(org.org)
      }
    })
  })

  // Step 3: Fetch per-org data (badge defs, seasons, badge status, beam metadata)
  const perOrgData = await Promise.all(
    Array.from(relevantOrgNames).map(async (orgName) => {
      const [badgeResult, seasonResult, badgeStatusResult, beamMeta] =
        await Promise.all([
          listBadge({ scope: orgName }),
          listSeason({ scope: orgName }),
          listBadgeStatus({ scope: orgName }),
          listBeamMetadata({ scope: orgName }),
        ])
      return {
        orgName,
        badges: badgeResult.rows,
        seasons: seasonResult.rows,
        badgeStatus: badgeStatusResult.rows,
        beamMeta,
      }
    })
  )

  // Merge per-org results
  const badges = perOrgData.flatMap((d) => d.badges)
  const seasons = perOrgData.flatMap((d) => d.seasons)
  const badgesStatus = perOrgData.flatMap((d) => d.badgeStatus)
  const beamMetadataFlat = perOrgData.flatMap((d) => d.beamMeta)

  const beamBadgeSymbols = new Set(
    beamMetadataFlat.map((meta) => meta.badge_symbol)
  )
  const beamTemplateNames = new Set(beamTemplates.map((t) => t.display_name))
  const trackingMetrics = ['Giving', 'Rep', 'Uniqueness']

  function getTrackingSymbols(beamSymbol: string): string[] {
    const [precision, code] = beamSymbol.split(',')
    if (!code) return []
    const suffix = code.slice(-3)
    const orgCode = code.slice(0, -3)
    const shortSuffix = suffix.slice(0, 2)
    return ['G', 'R', 'U'].map(
      (p) => `${precision},${orgCode}${p}${shortSuffix}`,
    )
  }

  function isBeamOrTrackingBadge(badge: Badge) {
    if (beamBadgeSymbols.has(badge.badge_symbol)) return true

    const displayName = badge.onchain_lookup_data?.user?.display_name
    if (!displayName) return false

    if (beamTemplateNames.has(displayName)) return true

    return trackingMetrics.some((metric) => {
      if (!displayName.endsWith(` ${metric}`)) return false
      const beamName = displayName.slice(0, -(metric.length + 1))
      return beamTemplateNames.has(beamName)
    })
  }

  function isTopLevelBeam(badge: Badge) {
    if (beamBadgeSymbols.has(badge.badge_symbol)) return true

    const displayName = badge.onchain_lookup_data?.user?.display_name
    if (!displayName) return false

    if (beamTemplateNames.has(displayName)) return true

    return false
  }

  const lifetimeBadgesBalanceSymbol = lifetimeBadges.map((userBadge) => {
    const [balance, symbol] = userBadge.balance.split(' ')
    const badge_symbol = `0,${symbol}`

    return {
      badge_symbol,
      balance: Number(balance),
      symbol,
    }
  })

  const { lifeTimeBadges, beamLifetimeBadges } = badges.reduce<{
    lifeTimeBadges: LifetimeBadges[]
    beamLifetimeBadges: LifetimeBadges[]
  }>(
    (acc, currentValue) => {
      const findUserBadge = lifetimeBadgesBalanceSymbol.find(
        (b) => b.badge_symbol === currentValue.badge_symbol
      )
      if (!findUserBadge) return acc

      const badgeSymbol = findUserBadge.symbol?.toLowerCase() ?? ''
      const matchingOrg = organization.find((org) =>
        badgeSymbol.startsWith(org.org_code.toLowerCase())
      )

      const entry: LifetimeBadges = {
        ...currentValue,
        balance: findUserBadge.balance,
        orgName:
          matchingOrg?.onchain_lookup_data?.user?.display_name ||
          matchingOrg?.org ||
          '',
        orgIpfsImage:
          matchingOrg?.offchain_lookup_data?.user?.ipfs_image || '',
        orgAccountName: matchingOrg?.org || '',
      }

      if (entry.balance <= 0) return acc

      if (isTopLevelBeam(currentValue)) {
        acc.beamLifetimeBadges.push(entry)
      } else if (!isBeamOrTrackingBadge(currentValue)) {
        acc.lifeTimeBadges.push(entry)
      }

      return acc
    },
    { lifeTimeBadges: [], beamLifetimeBadges: [] },
  )

  // Replace beam emit counts with reputation scores from tracking badges
  const balanceBySymbol = new Map(
    lifetimeBadgesBalanceSymbol.map((b) => [b.badge_symbol, b.balance]),
  )
  for (const beam of beamLifetimeBadges) {
    const trackingSymbols = getTrackingSymbols(beam.badge_symbol)
    const reputationScore = trackingSymbols.reduce(
      (sum, sym) => sum + (balanceBySymbol.get(sym) ?? 0),
      0,
    )
    beam.balance = reputationScore
  }

  const seriesPerSeason = await Promise.all(
    seasons.map((season) =>
      listSeries({ scope: season.agg_symbol.split(',')[1] })
    )
  )

  function buildSeasonData(
    filterFn: (badge: Badge) => boolean,
    useTrackingReputation = false,
  ) {
    return seasons.map((season, seasonIndex) => {
      const seasonSeries = seriesPerSeason[seasonIndex].rows.map(
        (seriesItem) => {
          // Build a map of all badge balances in this series for tracking lookup
          const seriesBalanceMap = new Map<string, number>()
          if (useTrackingReputation) {
            for (const crr of badgesStatus) {
              if (
                crr.seq_id === seriesItem.seq_id &&
                crr.agg_symbol === season.agg_symbol
              ) {
                const sb = seasonalBadges.find(
                  (item) => item.badge_agg_seq_id === crr.badge_agg_seq_id,
                )
                if (sb) seriesBalanceMap.set(crr.badge_symbol, sb.count)
              }
            }
          }

          const seriesBadge = badgesStatus.reduce<
            ({ balance: number } & Badge)[]
          >((acc, crr: BadgeStatus) => {
            if (
              crr.seq_id === seriesItem.seq_id &&
              crr.agg_symbol === season.agg_symbol
            ) {
              const badge = badges.find(
                (item) => item.badge_symbol === crr.badge_symbol
              )
              const seasonalBadgeBalance = seasonalBadges.find(
                (item) => item.badge_agg_seq_id === crr.badge_agg_seq_id
              )

              const rawBalance = seasonalBadgeBalance?.count ?? 0
              if (badge && filterFn(badge)) {
                let balance = rawBalance
                if (useTrackingReputation) {
                  const trackingSymbols = getTrackingSymbols(
                    badge.badge_symbol,
                  )
                  balance = trackingSymbols.reduce(
                    (sum, sym) => sum + (seriesBalanceMap.get(sym) ?? 0),
                    0,
                  )
                }
                if (balance > 0) {
                  acc.push({
                    ...badge,
                    balance,
                  })
                }
              }
            }

            return acc
          }, [])

          return {
            ...seriesItem,
            badges: seriesBadge,
          }
        },
      )

      const seasonSymbol = season.agg_symbol.split(',')[1]?.toLowerCase()
      const matchingOrg = organization.find((org) =>
        seasonSymbol?.startsWith(org.org_code.toLowerCase()),
      )
      const orgDisplayName =
        matchingOrg?.onchain_lookup_data?.user?.display_name ||
        matchingOrg?.org ||
        ''

      return {
        ...season,
        series: seasonSeries,
        orgDisplayName,
        orgIpfsImage:
          matchingOrg?.offchain_lookup_data?.user?.ipfs_image || '',
        orgAccountName: matchingOrg?.org || '',
      }
    }) as SeasonSeriesBadges[]
  }

  const seasonsWithBadgesAndSeries = buildSeasonData(
    (badge) => !isBeamOrTrackingBadge(badge),
  )
  const beamSeasonsData = buildSeasonData(isTopLevelBeam, true)

  return {
    badges: lifeTimeBadges,
    seasons: seasonsWithBadgesAndSeries,
    beamBadges: beamLifetimeBadges,
    beamSeasons: beamSeasonsData,
  }
}

export async function getUserProfile({ actor }: { actor: string }) {
  const user = await prisma.user.findUnique({
    where: {
      actor,
    },
  })

  return user
}

export async function getUserPosts({ user }: { user: string }) {
  const posts = await prisma.post.findMany({
    where: {
      user: { actor: user },
      parentId: null,
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
      createdAt: 'desc',
    },
  })

  return posts
}

export type UserOrganization = Organization & { isOwner: boolean }

export async function getUserOrganizations({
  user,
}: {
  user: string
}): Promise<UserOrganization[]> {
  const { rows: orgs } = await listOrganization({})

  const memberResults = await Promise.all(
    orgs.map(async (org) => {
      const { rows: members } = await listMembers({ scope: org.org })
      const isMember = members.some((m) => m.account === user)
      return { org, isMember }
    })
  )

  return memberResults
    .filter(({ isMember }) => isMember)
    .map(({ org }) => ({
      ...org,
      isOwner: org.org === user,
    }))
}

export async function getUserReputation({ user }: { user: string }) {
  const rows = await prisma.userReputationScore.findMany({
    where: { userActor: user },
    select: { orgAccount: true, totalScore: true },
  })

  const perOrg: Record<string, number> = {}
  let total = 0

  for (const row of rows) {
    const score = Math.round(row.totalScore * 100) / 100
    perOrg[row.orgAccount] = score
    total += score
  }

  return { perOrg, total: Math.round(total * 100) / 100 }
}

export type ReputationBreakdown = { name: string; score: number }[]

export async function getReputationBreakdown({
  user,
}: {
  user: string
}): Promise<ReputationBreakdown> {
  const rows = await prisma.beamGive.groupBy({
    by: ['badgeSymbol', 'orgAccount'],
    where: { recipientActor: user },
    _sum: { deltaScore: true },
  })

  if (rows.length === 0) return []

  // Collect unique org accounts to fetch badge definitions
  const orgAccounts = [...new Set(rows.map((r) => r.orgAccount))]
  const badgeResults = await Promise.all(
    orgAccounts.map((org) => listBadge({ scope: org })),
  )
  const badgesBySymbol = new Map(
    badgeResults.flatMap((r) =>
      r.rows.map((b) => [b.badge_symbol, b] as const),
    ),
  )

  // Aggregate by badge symbol across orgs
  const grouped = new Map<string, number>()
  for (const row of rows) {
    const score = row._sum.deltaScore ?? 0
    grouped.set(
      row.badgeSymbol,
      (grouped.get(row.badgeSymbol) ?? 0) + score,
    )
  }

  return Array.from(grouped.entries())
    .map(([symbol, score]) => {
      const badge = badgesBySymbol.get(symbol)
      const name =
        badge?.onchain_lookup_data.user.display_name ?? symbol
      return { name, score: Math.round(score * 100) / 100 }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

export async function getOrgMemberReputation({
  orgAccount,
}: {
  orgAccount: string
}): Promise<Record<string, number>> {
  const rows = await prisma.userReputationScore.findMany({
    where: { orgAccount },
    select: { userActor: true, totalScore: true },
  })

  const result: Record<string, number> = {}
  for (const row of rows) {
    result[row.userActor] = Math.round(row.totalScore * 100) / 100
  }
  return result
}
