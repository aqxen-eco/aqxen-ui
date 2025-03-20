import { GetTableRowsResult, Session } from './index'

export type Season = {
  agg_symbol: string
  offchain_lookup_data: {
    user: {
      ipfs_image: string
    }
  }
  onchain_lookup_data: {
    system: {
      created_at: number
    }
    user: {
      description: string
      display_name: string
    }
  }
  last_init_seq_id: number
  init_seq_ids: number[]
  active_seq_ids: number[]
  end_seq_ids: number[]
  init_badge_symbols: string[]
}

export type ListSeasonResult = GetTableRowsResult<Season>

export type ListSeasonProps = {
  scope?: string
  lower_bound?: string
  upper_bound?: string
}

export type CreateSeasonProps = {
  session: Session
  agg_symbol: string
  badge_symbols: string[]
  stats_badge_symbols: string[]
  ipfs_image: string
  display_name: string
  description: string
}

export type AddBadgeToSeasonProps = {
  session: Session
  agg_symbol: string
  badge_symbols: string[]
}
