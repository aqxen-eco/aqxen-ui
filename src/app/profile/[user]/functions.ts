'use server'

import { listBadge } from '@/api/chain/badge/list-badge'
import { listBadgeStatus } from '@/api/chain/badge/list-badge-status'
import { listLifetimeBadge } from '@/api/chain/badge/list-lifetime-badge'
import { listSeasonalBadge } from '@/api/chain/badge/list-seasonal-badge'
import { listOrganization } from '@/api/chain/organization/list-organization'
import { listSeason } from '@/api/chain/season/list-season'
import { listSeries } from '@/api/chain/series/list-series'
import { type Badge } from '@/api/model/badge'
import { BadgeStatus } from '@/api/model/badge'
import { type Season } from '@/api/model/season'
import { type Series } from '@/api/model/series'
import { prisma } from '@/prisma-client'

type GetUserBadgesProps = {
  user: string
}

type LifetimeBadges = {
  balance: number
} & Badge

type SeasonSeriesBadges = {
  series: (Series & { badges: ({ balance: number } & Badge)[] })[]
} & Season

type GetUserBadges = {
  badges: LifetimeBadges[]
  seasons: SeasonSeriesBadges[]
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

  const badgesOfAnotherOrganization = await Promise.all(
    organizationThatNeedsToGetBadges.map(async (org) => {
      const { rows: badgesOfAnotherOrganization } = await listBadge({
        scope: org,
      })
      return badgesOfAnotherOrganization
    })
  )

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

  const lifeTimeBadges = badges.reduce<Badge[]>((accumulate, currentValue) => {
    const findUserBadge = lifetimeBadgesBalanceSymbol.find(
      (b) => b.badge_symbol === currentValue.badge_symbol
    )
    if (!!findUserBadge) {
      return [
        ...accumulate,
        {
          ...currentValue,
          balance: findUserBadge.balance,
        },
      ]
    }
    return accumulate
  }, [])

  const series = await Promise.all(
    seasons.map((season) =>
      listSeries({ scope: season.agg_symbol.split(',')[1] })
    )
  )

  const seasonsWithBadgesAndSeries = seasons.map((season, seasonIndex) => {
    const seasonSeries = series[seasonIndex].rows.map((series) => {
      const seriesBadge = badgesStatus.reduce<Badge[]>(
        (acc, crr: BadgeStatus) => {
          if (
            crr.seq_id === series.seq_id &&
            crr.agg_symbol === season.agg_symbol
          ) {
            const badge = badges.find(
              (item) => item.badge_symbol === crr.badge_symbol
            )
            const seasonalBadgeBalance = seasonalBadges.find(
              (item) => item.badge_agg_seq_id === crr.badge_agg_seq_id
            )

            if (badge) {
              const badgeWithBalance = {
                ...badge,
                balance: seasonalBadgeBalance?.count ?? 0,
              }
              return [...acc, badgeWithBalance]
            }

            return acc
          }

          return acc
        },
        []
      )

      return {
        ...series,
        badges: seriesBadge,
      }
    })

    return {
      ...season,
      series: seasonSeries,
    }
  })

  return {
    badges: lifeTimeBadges as LifetimeBadges[],
    seasons: seasonsWithBadgesAndSeries as SeasonSeriesBadges[],
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
