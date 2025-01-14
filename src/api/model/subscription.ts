import { Session, GetTableRowsResult } from "./index";

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
};

export type ListSubscriptionResult = GetTableRowsResult<Subscription>

export type BuySubscriptionProps = {
  session: Session
  quantity: string
  memo: string
}