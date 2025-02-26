import { GetTableRowsResult, Session } from './index'

export type Organization = {
  org: string
  org_code: string
  checks_contract: boolean
  offchain_lookup_data: {
    ipfs: string
  }
  onchain_lookup_data: {
    created_at: number
    name: string
  }
}

export type ListOrganizationResult = GetTableRowsResult<Organization>

export type CreateOrganizationAndBuySubscriptionProps = {
  session: Session
  quantity: string
  subPackage: string
}

export type UpdateOrganizationProps = {
  session: Session
  org: string
  ipfs_image?: string
  display_name?: string
}
