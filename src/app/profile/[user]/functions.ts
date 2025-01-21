'use server'

import { type Badge, listBadge } from '@/api/chain/badge'
import { listSeason, type Season } from '@/api/chain/season'

type GetUserBadgesProps = {
  user: string
}

export type Seasons = Array<
  {
    badges: Badge[]
  } & Omit<Season, 'badges'>
>

type GetUserBadges = {
  badges: Badge[]
  seasons: Seasons
}

export async function getUserBadges({
  user,
}: GetUserBadgesProps): Promise<GetUserBadges> {
  const { rows: userBadges } = await listBadge({
    scope: user,
  })

  const { rows } = await listSeason({
    scope: user,
  })

  const userSeasons = rows.map((row) => ({
    ...row,
    badges: userBadges.filter((userBadge) => row.badges.includes(userBadge.id)),
  }))

  return {
    badges: userBadges,
    seasons: userSeasons,
  }
}
