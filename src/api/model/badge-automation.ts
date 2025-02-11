import { GetTableRowsResult, Session } from './index'

export type BadgeAutomation = {
  id: string
  symbol: string
  ipfs: string
  name: string
  notify_accounts: string[]
  rarity_counts: string
}

export type ListBadgeAutomationResult = GetTableRowsResult<BadgeAutomation>

export type CreateBadgeAutomationProps = {
  session: Session
  symbol: string
  ipfs: string
  name: string
  lifetime_aggregate: boolean
  lifetime_stats: boolean
  memo: string
}
