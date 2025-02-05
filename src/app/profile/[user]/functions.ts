'use server'

import { type Badge, listBadge } from '@/api/chain/badge'
import { listBadgeStatus } from '@/api/chain/badge/list-badge-status'
import { listUserBadge } from '@/api/chain/badge/list-user-badge'
import { listSeason, type Season } from '@/api/chain/season'
import { listSeries, type Series } from '@/api/chain/series'
import { BadgeStatus } from '@/api/model/badge'

type GetUserBadgesProps = {
  user: string
}

export type Seasons = Array<
  {
    series: (Series & { badges: Badge[] })[]
  } & Omit<Season, 'badges'>
>

type UserBadges = {
  balance: string
} & Badge

type GetUserBadges = {
  badges: UserBadges[]
  seasons: Seasons
}

export async function getUserBadges({
  user,
}: GetUserBadgesProps): Promise<GetUserBadges> {
  const [
    { rows: badges },
    { rows: seasons },
    { rows: userBadges },
    { rows: badgesStatus },
  ] = await Promise.all([
    listBadge({
      scope: user,
    }),
    listSeason({
      scope: user,
    }),
    listUserBadge({
      scope: user,
    }),
    listBadgeStatus({
      scope: user,
    }),
  ])

  const userBadgesBalanceSymbol = userBadges.map((userBadge) => ({
    balance: userBadge.balance.split(' ')[0],
    symbol: userBadge.balance.split(' ')[1],
  }))

  const lifeTimeBadges = badges.reduce((accumulate, currentValue) => {
    const findUserBadge = userBadgesBalanceSymbol.find(
      (b) => b.symbol === currentValue.symbol
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
  }, [] as UserBadges[])

  const seriesPromise = seasons.map((season) =>
    listSeries({ scope: season.symbol })
  )
  const series = await Promise.all(seriesPromise)

  // console.log(badgesStatus)

  const seasonsWithBadgesAndSeries = seasons.map((season, seasonIndex) => {
    const seasonSeries = series[seasonIndex].rows.map((series) => {
      const seriesBadge = badgesStatus.reduce<Badge[]>(
        (acc, crr: BadgeStatus) => {
          if (crr.seq_id === series.id && crr.agg_symbol === season.id) {
            const badge = badges.find((item) => item.id === crr.badge_symbol)

            if (badge) {
              return [...acc, badge]
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
      badges: badges.filter((userBadge) =>
        season.badges.includes(userBadge.id)
      ),
      series: seasonSeries,
    }
  })

  return {
    badges: lifeTimeBadges,
    seasons: seasonsWithBadgesAndSeries,
  }
}
