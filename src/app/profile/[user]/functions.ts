'use server'

import { type Badge, listBadge } from '@/api/chain/badge'
import { listUserBadge } from '@/api/chain/badge/list-user-badge'
import { listSeason, type Season } from '@/api/chain/season'
import { listSeries, Series } from '@/api/chain/series'

type GetUserBadgesProps = {
  user: string
}

export type Seasons = Array<
  {
    badges: Badge[]
    series: Series[]
  } & Omit<Season, 'badges'>
>

type GetUserBadges = {
  badges: Badge[]
  seasons: Seasons
}

export async function getUserBadges({
  user,
}: GetUserBadgesProps): Promise<GetUserBadges> {
  const [{ rows: badges }, { rows: seasons }, { rows: userBadges }] =
    await Promise.all([
      listBadge({
        scope: user,
      }),
      listSeason({
        scope: user,
      }),
      listUserBadge({
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
  }, [] as Badge[])

  const seriesPromise = seasons.map((season) =>
    listSeries({ scope: season.symbol })
  )
  const series = await Promise.all(seriesPromise)

  const seasonsWithBadgesAndSeries = seasons.map((season, seasonIndex) => ({
    ...season,
    badges: badges.filter((userBadge) => season.badges.includes(userBadge.id)),
    series: series[seasonIndex].rows,
  }))

  return {
    badges: lifeTimeBadges,
    seasons: seasonsWithBadgesAndSeries,
  }
}
