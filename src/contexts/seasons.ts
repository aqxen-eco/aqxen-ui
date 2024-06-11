import { createContext } from 'react'

import { BadgesFilter } from '@/models/badges'
import { OrgAggregateType, OrgSequenceType, AchievementResponse, OrgBadgeStatusType } from '@/models/seasons'

export interface SeasonsContextOptions {
  orgAggregates: OrgAggregateType[]
  orgSequences: OrgSequenceType[]
  orgSeasonalBadges: OrgBadgeStatusType[]
  userSeasonalBadges: ({ scope, queryType, lowerBound, upperBound }: BadgesFilter) => Promise<AchievementResponse>
}

export const SeasonsContext = createContext<SeasonsContextOptions>({
  orgAggregates: [] as OrgAggregateType[],
  orgSequences: [] as OrgSequenceType[],
  orgSeasonalBadges: [] as OrgBadgeStatusType[],
  userSeasonalBadges: () => Promise.resolve({} as AchievementResponse)
})
