import { GetTableRowsResult, Session } from './index'

export type ListBadgeProps = {
  scope?: string
  lower_bound?: string
  upper_bound?: string
}

export type Badge = {
  badge_symbol: string
  notify_accounts: string[]
  offchain_lookup_data: {
    user: {
      ipfs_image: string
    }
  }
  onchain_lookup_data: {
    system: {
      created_at: string
    }
    user: {
      description: string
      display_name: string
    }
  }
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
  display_name: string
  ipfs_image: string
  description: string
  lifetime_aggregate: boolean
  lifetime_stats: boolean
  memo: string
}

export type SendBadgeProps = {
  session: Session
  badge_symbol: string
  amount: number
  to: string
  memo: string
}
