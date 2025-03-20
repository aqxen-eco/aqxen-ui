'use server'

import { listBadge } from '@/api/chain/badge/list-badge'
import { listBadgeStatus } from '@/api/chain/badge/list-badge-status'
import { listLifetimeBadge } from '@/api/chain/badge/list-lifetime-badge'
import { listSeasonalBadge } from '@/api/chain/badge/list-seasonal-badge'
import { listSeason } from '@/api/chain/season/list-season'
import { listSeries } from '@/api/chain/series/list-series'
import { type Badge } from '@/api/model/badge'
import { BadgeStatus } from '@/api/model/badge'
import { type Season } from '@/api/model/season'
import { type Series } from '@/api/model/series'

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
    { rows: badges },
    { rows: seasons },
    { rows: lifetimeBadges },
    { rows: seasonalBadges },
    { rows: badgesStatus },
  ] = await Promise.all([
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

  const lifetimeBadgesBalanceSymbol = lifetimeBadges.map((userBadge) => {
    const balance = Number(userBadge.balance.split(' ')[0])
    const symbol = userBadge.balance.split(' ')[1]
    const badge_symbol = `0,${symbol}`

    return {
      badge_symbol,
      balance,
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
    seasons.map((season) => listSeries({ scope: season.agg_symbol }))
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
