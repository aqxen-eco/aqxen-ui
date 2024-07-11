import { APIClient, Checksum160, Checksum256, Float64, Name, UInt64, UInt128 } from '@wharfkit/antelope'
import { ReactNode, useEffect, useState } from 'react'

import { BADGES_INFO_CONTRACT, CHAIN_API_URL, I64, ORG, Tables, USER_BADGES_CONTRACT } from '@/constants'
import { BadgesContext } from '@/contexts/badges.ts'
import {
  BadgeFilterType,
  BadgeResponse,
  BadgesFilter,
  BadgeType,
  Bound,
  OrgBadgeResponse,
  OrgBadgeType
} from '@/models/badges'

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

const KEY_TYPE: Record<BadgeFilterType, string> = {
  [BadgeFilterType.DEFAULT]: I64
}

const INDEX_POSITION: Record<BadgeFilterType, IndexPosition> = {
  [BadgeFilterType.DEFAULT]: 'primary'
}

const jungleClient = new APIClient({
  url: CHAIN_API_URL
})

export interface BadgesProviderProps {
  children: ReactNode
}

interface GetTableRowsResult<T, K = TableIndexType> {
  rows: T[]
  more: boolean
  next_key: K
}

async function getOrgBadges({ queryType }: BadgesFilter): Promise<OrgBadgeResponse> {
  const data = {
    code: BADGES_INFO_CONTRACT,
    scope: ORG,
    table: Tables.BADGE,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    limit: 1000
  }

  const { rows, next_key, more } = (await jungleClient.v1.chain.get_table_rows<Bound>(data)) as GetTableRowsResult<
    OrgBadgeType,
    UInt64 | UInt128
  >

  console.debug('Org Badges')
  console.debug(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null
  }
}

async function getUserBadges({ scope, queryType, lowerBound, upperBound }: BadgesFilter): Promise<BadgeResponse> {
  const data = {
    code: USER_BADGES_CONTRACT,
    scope: scope,
    table: Tables.ACCOUNTS,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    ...(lowerBound != null ? { lower_bound: lowerBound as unknown as Bound } : {}),
    ...(upperBound != null ? { upper_bound: upperBound as unknown as Bound } : {}),
    limit: 1000
  }

  const { rows, next_key, more } = (await jungleClient.v1.chain.get_table_rows<Bound>(data)) as GetTableRowsResult<
    BadgeType,
    UInt64 | UInt128
  >

  console.debug('User Lifetime Badges')
  console.debug(rows)

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null
  }
}

export default function BadgesProvider({ children }: BadgesProviderProps) {
  const [orgBadges, setOrgBadges] = useState<OrgBadgeType[]>([])

  async function getBadges() {
    const responseOrg = await getOrgBadges({
      queryType: BadgeFilterType.DEFAULT
    })
    if (responseOrg?.rows?.length) {
      setOrgBadges(responseOrg.rows)
    }
  }

  useEffect(() => {
    getBadges()
  }, [])

  return <BadgesContext.Provider value={{ orgBadges, userBadges: getUserBadges }}>{children}</BadgesContext.Provider>
}
