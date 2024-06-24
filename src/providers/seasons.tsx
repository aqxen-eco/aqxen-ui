import { APIClient, Checksum160, Checksum256, Float64, Name, UInt64, UInt128 } from '@wharfkit/antelope'
import { ReactNode, useEffect, useState } from 'react'

import { SeasonsContext } from '@/contexts/seasons.ts'
import { BadgesFilter } from '@/models/badges'
import {
  AchievementResponse,
  AchievementType,
  Bound,
  OrgAggregateResponse,
  OrgAggregateType,
  OrgBadgeStatusResponse,
  OrgBadgeStatusType,
  OrgSequenceResponse,
  OrgSequenceType,
  SeasonFilterType,
  SeasonsFilter
} from '@/models/seasons'

const I64 = 'i64'
const CHAIN_API_URL = 'https://jungle.eosusa.io/'
const SEASONS_INFO_CONTRACT = 'baggyyyyyyyy'
const ORG = 'alexandresjr'

type TableIndexType = Name | UInt64 | UInt128 | Float64 | Checksum256 | Checksum160

type IndexPosition =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'fourth'
  | 'fifth'
  | 'sixth'
  | 'seventh'
  | 'eighth'
  | 'ninth'
  | 'tenth'
  | undefined

enum Tables {
  AGGREGATES = 'aggdetails',
  SEQUENCES = 'sequence',
  BADGESTATUS = 'badgestatus',
  ACHIEVEMENTS = 'achievements'
}

const KEY_TYPE: Record<SeasonFilterType, string> = {
  [SeasonFilterType.DEFAULT]: I64
}

const INDEX_POSITION: Record<SeasonFilterType, IndexPosition> = {
  [SeasonFilterType.DEFAULT]: 'primary'
}

const jungleClient = new APIClient({
  url: CHAIN_API_URL
})

export interface SeasonsProviderProps {
  children: ReactNode
}

interface GetTableRowsResult<T, K = TableIndexType> {
  rows: T[]
  more: boolean
  next_key: K
}

async function getOrgAggregates({ queryType, lowerBound, upperBound }: SeasonsFilter): Promise<OrgAggregateResponse> {
  const data = {
    code: SEASONS_INFO_CONTRACT,
    scope: ORG,
    table: Tables.AGGREGATES,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    ...(lowerBound != null ? { lower_bound: lowerBound as unknown as Bound } : {}),
    ...(upperBound != null ? { upper_bound: upperBound as unknown as Bound } : {}),
    limit: 1000
  }

  const { rows, next_key, more } = (await jungleClient.v1.chain.get_table_rows<Bound>(data)) as GetTableRowsResult<
    OrgAggregateType,
    UInt64 | UInt128
  >

  console.log('Aggregates')
  console.log(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null
  }
}

async function getOrgSequences({ scope, queryType }: SeasonsFilter): Promise<OrgSequenceResponse> {
  const data = {
    code: SEASONS_INFO_CONTRACT,
    scope: scope, // Aggregate Symbol
    table: Tables.SEQUENCES,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    limit: 1000
  }

  const { rows, next_key, more } = (await jungleClient.v1.chain.get_table_rows<Bound>(data)) as GetTableRowsResult<
    OrgSequenceType,
    UInt64 | UInt128
  >

  console.log('Sequences')
  console.log(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null
  }
}

async function getOrgSeasonalBadges({ queryType }: SeasonsFilter): Promise<OrgBadgeStatusResponse> {
  const data = {
    code: SEASONS_INFO_CONTRACT,
    scope: ORG,
    table: Tables.BADGESTATUS,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    limit: 1000
  }

  const { rows, next_key, more } = (await jungleClient.v1.chain.get_table_rows<Bound>(data)) as GetTableRowsResult<
    OrgBadgeStatusType,
    UInt64 | UInt128
  >

  console.log('Badge Status')
  console.log(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null
  }
}

async function getUserSeasonalBadges({
  scope,
  queryType,
  lowerBound,
  upperBound
}: BadgesFilter): Promise<AchievementResponse> {
  const data = {
    code: SEASONS_INFO_CONTRACT,
    scope: scope,
    table: Tables.ACHIEVEMENTS,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    ...(lowerBound != null ? { lower_bound: lowerBound as unknown as Bound } : {}),
    ...(upperBound != null ? { upper_bound: upperBound as unknown as Bound } : {}),
    limit: 1000
  }

  const { rows, next_key, more } = (await jungleClient.v1.chain.get_table_rows<Bound>(data)) as GetTableRowsResult<
    AchievementType,
    UInt64 | UInt128
  >

  console.log('Seasonal Badges / Achievements')
  console.log(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null
  }
}

export default function SeasonsProvider({ children }: SeasonsProviderProps) {
  const [orgAggregates, setOrgAggregates] = useState<OrgAggregateType[]>([])
  const [orgSequences, setOrgSequences] = useState<OrgSequenceType[]>([])
  const [orgSeasonalBadges, setOrgSeasonalBadges] = useState<OrgBadgeStatusType[]>([])
  const [currentOrgAggregate, setCurrentOrgAggregate] = useState<number>(0)
  const [currentOrgSequence, setCurrentOrgSequence] = useState<number>(0)

  async function getSeasons() {
    const responseOrgAggregates = await getOrgAggregates({
      queryType: SeasonFilterType.DEFAULT
    })
    if (responseOrgAggregates?.rows?.length) {
      setOrgAggregates(responseOrgAggregates.rows)

      let allSequences = [] as OrgSequenceType[]

      for (const agg in responseOrgAggregates.rows) {
        const responseOrgSequences = await getOrgSequences({
          scope: responseOrgAggregates?.rows?.[agg]?.agg_symbol?.split(',', 2)[1] ?? '',
          queryType: SeasonFilterType.DEFAULT
        })
        // TODO: Still need to assign each specific sequence to its aggregate
        if (responseOrgSequences?.rows?.length) {
          allSequences = allSequences.concat(responseOrgSequences.rows)
        }
      }

      setOrgSequences(allSequences)
    }

    const responseOrgBadges = await getOrgSeasonalBadges({
      queryType: SeasonFilterType.DEFAULT
    })
    if (responseOrgBadges?.rows?.length) {
      setOrgSeasonalBadges(responseOrgBadges.rows)
    }
  }

  useEffect(() => {
    getSeasons()
  }, [])

  return (
    <SeasonsContext.Provider
      value={{
        orgAggregates,
        orgSequences,
        orgSeasonalBadges,
        userSeasonalBadges: getUserSeasonalBadges,
        currentOrgAggregate,
        setCurrentOrgAggregate,
        currentOrgSequence,
        setCurrentOrgSequence
      }}
    >
      {children}
    </SeasonsContext.Provider>
  )
}
