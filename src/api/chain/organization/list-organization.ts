import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import { ListOrganizationResult } from '@/api/model/organization'

type ListOrganizationProps = {
  lower_bound?: string
  upper_bound?: string
}

export async function listOrganization({
  lower_bound,
  upper_bound,
}: ListOrganizationProps): Promise<ListOrganizationResult> {
  const { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: 'organizayyyy',
    scope: 'organizayyyy',
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    table: 'orgs',
    json: true,
    limit: 1,
  })

  return {
    rows,
    more,
  }
}
