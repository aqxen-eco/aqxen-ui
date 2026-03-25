import type { UInt64 } from '@wharfkit/antelope'

import { GetTableRowsResult, Session } from './index'

export type Fee = {
  id: string
  org_creation_fee: string
  member_fee: string
}

export type ListFeesResult = GetTableRowsResult<Fee>

export type BillingDetail = {
  bill_cycle_id: UInt64
  amount_paid: string
  members_paid_for: UInt64
  allowed_actions: Array<{ key: string; value: UInt64 }>
  used_actions: Array<{ key: string; value: UInt64 }>
  payment_symbol: string
}

export type GetBillingDetailProps = {
  session: Session
}
export type GetBillingDetailResult = GetTableRowsResult<BillingDetail>

export type TransferTokenProps = {
  session: Session
  quantity: string
  currentCycleId: UInt64
  memberCount: number
}
