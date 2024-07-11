import { useContext } from 'react'

import { SeasonsContext } from '@/contexts/seasons.ts'
import { BadgesFilter } from '@/models/badges'
import { AchievementResponse, OrgAggregateType, OrgBadgeStatusType, OrgSequenceType } from '@/models/seasons.js'

export interface SeasonsOptions {
  orgAggregates: OrgAggregateType[]
  orgSequences: OrgSequenceType[]
  orgSeasonalBadges: OrgBadgeStatusType[]
  userSeasonalBadges: ({ scope, queryType, lowerBound, upperBound }: BadgesFilter) => Promise<AchievementResponse>
}

export function useSeasons(): SeasonsOptions {
  const { orgSequences, orgAggregates, orgSeasonalBadges, userSeasonalBadges } = useContext(SeasonsContext)

  return {
    orgAggregates,
    orgSequences,
    orgSeasonalBadges,
    userSeasonalBadges
  }
}
