import { GetTableRowsResult, Session } from './index'

export type Badge = {
  id: string
  symbol: string
  ipfs: string
  name: string
  notify_accounts: string[]
  rarity_counts: string
}

export type ListBadgeResult = GetTableRowsResult<Badge>

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
