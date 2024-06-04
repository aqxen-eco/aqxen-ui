import { UInt64, UInt128 } from '@wharfkit/antelope'

export type Bound = UInt64 | UInt128

export enum BadgeFilterType {
  DEFAULT = 'DEFAULT'
}

export interface OrgBadgeType {
  badge_symbol: string
  notify_accounts: string[]
  offchain_lookup_data: string
  onchain_lookup_data: string
  rarity_counts: number
}

export interface BadgeType {
  balance: string
}

export interface OrgBadgeResponse {
  rows: OrgBadgeType[] | null
  next_key: string | null
  more: boolean
}

export interface BadgeResponse {
  rows: BadgeType[] | null
  next_key: string | null
  more: boolean
}

export interface BadgesFilter {
  scope?: string
  queryType?: BadgeFilterType
  lowerBound?: number | string | Bound
  upperBound?: number | string | Bound
  returnFirstIteration?: boolean
}
