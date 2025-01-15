import { jungleClient } from '@/api/chain/jungle-client'
import { I64, ORG, SEASONS_INFO_CONTRACT, Table } from '@/constants'

import type { BadgesFilter } from '../_models/badges'
import type {
  AchievementResponse,
  Bound,
  OrgAggregateResponse,
  OrgAggregateType,
  OrgBadgeStatusResponse,
  OrgBadgeStatusType,
  OrgSequenceResponse,
  OrgSequenceType,
  SeasonFilterType,
  SeasonsFilter,
} from '../_models/seasons'
import { SeasonFilterType as SeasonFilterEnum } from '../_models/seasons'
import type { IndexPosition } from '../_models/types'

const KEY_TYPE: Record<SeasonFilterType, string> = {
  [SeasonFilterEnum.DEFAULT]: I64,
}

const INDEX_POSITION: Record<SeasonFilterType, IndexPosition> = {
  [SeasonFilterEnum.DEFAULT]: 'primary',
}

export async function getOrgAggregates({
  queryType,
  lowerBound,
  upperBound,
}: SeasonsFilter): Promise<OrgAggregateResponse> {
  const { rows, next_key, more } = await jungleClient.v1.chain.get_table_rows({
    code: SEASONS_INFO_CONTRACT,
    scope: ORG,
    table: Table.AGGREGATES,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    ...(lowerBound != null
      ? { lower_bound: lowerBound as unknown as Bound }
      : {}),
    ...(upperBound != null
      ? { upper_bound: upperBound as unknown as Bound }
      : {}),
    limit: 1000,
  })

  console.debug('Aggregates')
  console.debug(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null,
  }
}

export async function getOrgSequences({
  scope,
  queryType,
}: SeasonsFilter): Promise<OrgSequenceResponse> {
  const { rows, next_key, more } = await jungleClient.v1.chain.get_table_rows({
    code: SEASONS_INFO_CONTRACT,
    scope: scope, // Aggregate Symbol
    table: Table.SEQUENCES,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    limit: 1000,
  })

  console.debug('Sequences')
  console.debug(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null,
  }
}

export async function getOrgSeasonalBadges({
  queryType,
}: SeasonsFilter): Promise<OrgBadgeStatusResponse> {
  const { rows, next_key, more } = await jungleClient.v1.chain.get_table_rows({
    code: SEASONS_INFO_CONTRACT,
    scope: ORG,
    table: Table.BADGESTATUS,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    limit: 1000,
  })

  console.debug('Badge Status')
  console.debug(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null,
  }
}

export async function getUserSeasonalBadges({
  scope,
  queryType,
  lowerBound,
  upperBound,
}: BadgesFilter): Promise<AchievementResponse> {
  const { rows, next_key, more } = await jungleClient.v1.chain.get_table_rows({
    code: SEASONS_INFO_CONTRACT,
    scope: scope,
    table: Table.ACHIEVEMENTS,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    ...(lowerBound != null
      ? { lower_bound: lowerBound as unknown as Bound }
      : {}),
    ...(upperBound != null
      ? { upper_bound: upperBound as unknown as Bound }
      : {}),
    limit: 1000,
  })

  console.debug('Seasonal Badges / Achievements')
  console.debug(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null,
  }
}

export async function getSeasons() {
  let orgAggregates = [] as OrgAggregateType[]
  let orgSequences = [] as OrgSequenceType[]
  let orgSeasonalBadges = [] as OrgBadgeStatusType[]

  const responseOrgAggregates = await getOrgAggregates({
    queryType: SeasonFilterEnum.DEFAULT,
  })

  if (responseOrgAggregates?.rows?.length) {
    let allSequences = [] as OrgSequenceType[]

    for (const agg in responseOrgAggregates.rows) {
      const responseOrgSequences = await getOrgSequences({
        scope:
          responseOrgAggregates?.rows?.[agg]?.agg_symbol?.split(',', 2)[1] ??
          '',
        queryType: SeasonFilterEnum.DEFAULT,
      })

      if (responseOrgSequences?.rows?.length) {
        responseOrgAggregates.rows[agg].agg_sequences =
          responseOrgSequences.rows

        allSequences = allSequences.concat(responseOrgSequences.rows)
      }
    }

    orgAggregates = responseOrgAggregates.rows
    // TODO: Review as we might be able to delete this if Sequences are enough within Aggregates
    orgSequences = allSequences
  }

  const responseOrgBadges = await getOrgSeasonalBadges({
    queryType: SeasonFilterEnum.DEFAULT,
  })
  if (responseOrgBadges?.rows?.length) {
    orgSeasonalBadges = responseOrgBadges.rows
  }

  return {
    orgAggregates,
    orgSequences,
    orgSeasonalBadges,
  }
}
