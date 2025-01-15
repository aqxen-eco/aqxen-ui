import { GetTableRowsResult } from './index'

export type Organization = {
  org: string
  org_code: string
}

export type ListOrganizationResult = GetTableRowsResult<Organization>
