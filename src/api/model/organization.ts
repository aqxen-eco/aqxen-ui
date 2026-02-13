import type { UInt64 } from '@wharfkit/antelope'

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

export type CreateOrganizationProps = {
  session: Session
  org_creation_fee: string
  member_fee: string
  currentCycleId: UInt64
}

export type UpdateOrganizationProps = {
  session: Session
  org: string
  ipfs_image?: string
  display_name?: string
}

export type Member = {
  account: string
  joined_at: string
}

export type MemberRequest = {
  account: string
  requested_at: string
  memo: string
}

export type ListMembersResult = GetTableRowsResult<Member>

export type ListMemberRequestsResult = GetTableRowsResult<MemberRequest>

export type MemberActionProps = {
  session: Session
  org: string
  user: string
  memo: string
}
