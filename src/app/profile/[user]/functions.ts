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
  const [
    { rows: organization },
    { rows: badges },
    { rows: seasons },
    { rows: lifetimeBadges },
    { rows: seasonalBadges },
    { rows: badgesStatus },
  ] = await Promise.all([
    listOrganization({}),
    listBadge({
      scope: user,
    }),
    listSeason({
      scope: user,
    }),
    listLifetimeBadge({
      scope: user,
    }),
    listSeasonalBadge({
      scope: user,
    }),
    listBadgeStatus({
      scope: user,
    }),
  ])

  const organizationThatNeedsToGetBadges = [] as string[]

  organization.forEach((org) => {
    lifetimeBadges.forEach((userBadge) => {
      const symbol = userBadge.balance.split(' ')[1].toLowerCase()
      const orgCode = org.org_code.toLowerCase()

      if (symbol.startsWith(orgCode)) {
        if (!organizationThatNeedsToGetBadges.includes(org.org)) {
          organizationThatNeedsToGetBadges.push(org.org)
        }
      }
    })
  })

  // Collect all org accounts from both lifetime badges and seasons
  const allRelevantOrgs = new Set(organizationThatNeedsToGetBadges)
  for (const season of seasons) {
    const seasonSymbol = season.agg_symbol.split(',')[1]?.toLowerCase()
    if (seasonSymbol) {
      const matchingOrg = organization.find((org) =>
        seasonSymbol.startsWith(org.org_code.toLowerCase())
      )
      if (matchingOrg) allRelevantOrgs.add(matchingOrg.org)
    }
  }

  const allRelevantOrgsArray = Array.from(allRelevantOrgs)

  const [badgesOfAnotherOrganization, beamMetadataPerOrg, beamTemplates] =
    await Promise.all([
      Promise.all(
        organizationThatNeedsToGetBadges.map(async (org) => {
          const { rows } = await listBadge({ scope: org })
          return rows
        })
      ),
      Promise.all(
        allRelevantOrgsArray.map((org) => listBeamMetadata({ scope: org }))
      ),
      listBeamTemplates(),
    ])

  const beamBadgeSymbols = new Set(
    beamMetadataPerOrg.flat().map((meta) => meta.badge_symbol)
  )
  const beamTemplateNames = new Set(beamTemplates.map((t) => t.display_name))
  const trackingMetrics = ['Giving', 'Rep', 'Uniqueness']

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

  const badgesOfAnotherOrganizationFlatted = badgesOfAnotherOrganization.flat()

  badges.push(...badgesOfAnotherOrganizationFlatted)

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

      if (isTopLevelBeam(currentValue)) {
        acc.beamLifetimeBadges.push(entry)
      } else if (!isBeamOrTrackingBadge(currentValue)) {
        acc.lifeTimeBadges.push(entry)
      }

      return acc
    },
    { lifeTimeBadges: [], beamLifetimeBadges: [] },
  )

  const seriesPerSeason = await Promise.all(
    seasons.map((season) =>
      listSeries({ scope: season.agg_symbol.split(',')[1] })
    )
  )

  function buildSeasonData(filterFn: (badge: Badge) => boolean) {
    return seasons.map((season, seasonIndex) => {
      const seasonSeries = seriesPerSeason[seasonIndex].rows.map(
        (seriesItem) => {
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

              if (badge && filterFn(badge)) {
                acc.push({
                  ...badge,
                  balance: seasonalBadgeBalance?.count ?? 0,
                })
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
  const beamSeasonsData = buildSeasonData(isTopLevelBeam)

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
