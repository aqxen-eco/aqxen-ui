import { GetTableRowsResult, Session } from './index'

export type Badge = {
  id: string
  symbol: string
  ipfs: string
  name: string
  notify_accounts: string[]
  rarity_counts: string
}

export type LifetimeBadge = {
  balance: string
}

export type SeasonalBadge = {
  badge_agg_seq_id: number
  count: number
}

export type BadgeStatus = {
  badge_agg_seq_id: number
  agg_symbol: string
  seq_id: number
  badge_symbol: string
  badge_status: string
  seq_status: string
}

export type ListBadgeResult = GetTableRowsResult<Badge>

export type ListLifetimeBadgeResult = GetTableRowsResult<LifetimeBadge>

export type ListSeasonalBadgeResult = GetTableRowsResult<SeasonalBadge>

export type ListBadgeStatusResult = GetTableRowsResult<BadgeStatus>

export type CreateBadgeProps = {
  session: Session
  symbol: string
  ipfs: string
  name: string
  lifetime_aggregate: boolean
  lifetime_stats: boolean
  memo: string
}

export type SendBadgeProps = {
  session: Session
  symbol: string
  amount: number
  to: string
  memo: string
}
