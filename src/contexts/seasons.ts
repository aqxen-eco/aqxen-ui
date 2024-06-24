import { createContext } from 'react'

import { BadgesFilter } from '@/models/badges'
import { AchievementResponse, OrgAggregateType, OrgBadgeStatusType, OrgSequenceType } from '@/models/seasons'

export interface SeasonsContextOptions {
  orgAggregates: OrgAggregateType[]
  orgSequences: OrgSequenceType[]
  orgSeasonalBadges: OrgBadgeStatusType[]
  userSeasonalBadges: ({ scope, queryType, lowerBound, upperBound }: BadgesFilter) => Promise<AchievementResponse>
  currentOrgAggregate: number
  setCurrentOrgAggregate: (agg: number) => void
  currentOrgSequence: number
  setCurrentOrgSequence: (seq: number) => void
}

export const SeasonsContext = createContext<SeasonsContextOptions>({
  orgAggregates: [] as OrgAggregateType[],
  orgSequences: [] as OrgSequenceType[],
  orgSeasonalBadges: [] as OrgBadgeStatusType[],
  userSeasonalBadges: () => Promise.resolve({} as AchievementResponse),
  currentOrgAggregate: 0,
  setCurrentOrgAggregate: () => undefined,
  currentOrgSequence: 0,
  setCurrentOrgSequence: () => undefined
})
