import { useContext } from 'react'

import { BadgesContext } from '@/contexts/badges.ts'
import { BadgeResponse, BadgesFilter, OrgBadgeType } from '@/models/badges'

export interface BadgesOptions {
  orgBadges: OrgBadgeType[],
  userBadges: ({ scope, queryType, lowerBound, upperBound }: BadgesFilter) => Promise<BadgeResponse>
}

export function useBadges(): BadgesOptions {
  const { orgBadges, userBadges } = useContext(BadgesContext)

  return {
    orgBadges,
    userBadges
  }
}
