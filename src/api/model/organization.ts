import { GetTableRowsResult, Session } from './index'

export type Organization = {
  org: string
  org_code: string
  checks_contract: boolean
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
      display_name: string
    }
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
