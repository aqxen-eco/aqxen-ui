import { createContext } from 'react'

import { BadgeResponse, BadgesFilter, OrgBadgeType } from '@/models/badges'

export interface BadgesContextOptions {
  orgBadges: OrgBadgeType[]
  userBadges: ({ scope, queryType, lowerBound, upperBound }: BadgesFilter) => Promise<BadgeResponse>
}

export const BadgesContext = createContext<BadgesContextOptions>({
  orgBadges: [] as OrgBadgeType[],
  userBadges: () => Promise.resolve({} as BadgeResponse)
})
