import type { UInt64 } from '@wharfkit/antelope'

import { GetTableRowsResult, Session } from './index'

export type Subscription = {
  action_size: number
  active: number
  cost: {
    quantity: string
    contract: string
  }
  descriptive_name: string
  display: number
  expiry_duration_in_secs: number
  package: string
}

export type ListSubscriptionResult = GetTableRowsResult<Subscription>

export type OrganizationSubscription = {
  actions_used: number
  expiry_duration_in_secs: number
  expiry_time: string
  package: string
  seq_id: number
  status: string
  total_actions_bought: number
}

export type ListOrganizationSubscriptionResult =
  GetTableRowsResult<OrganizationSubscription>

export type BuySubscriptionProps = {
  session: Session
  quantity: string
  currentCycleId: UInt64
}
