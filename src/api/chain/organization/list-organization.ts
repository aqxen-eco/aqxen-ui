import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import { ListOrganizationResult } from '@/api/model/organization'
import { Contract, HIDDEN_ORGS } from '@/constants'
import { safeParse } from '@/utils/safe-parse'

type ListOrganizationProps = {
  lower_bound?: string
  upper_bound?: string
}

export async function listOrganization({
  lower_bound,
  upper_bound,
}: ListOrganizationProps): Promise<ListOrganizationResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.ORGANIZATION,
    scope: Contract.ORGANIZATION,
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    table: 'orgs',
    json: true,
    limit: 1000,
  })

  rows = rows
    .map((row) => ({
      ...row,
      offchain_lookup_data: safeParse(row.offchain_lookup_data),
      onchain_lookup_data: safeParse(row.onchain_lookup_data),
    }))
    .filter((row) => !HIDDEN_ORGS.includes(row.org))

  return {
    rows,
    more,
  }
}
