import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListBadgeProps, ListBadgeResult } from '@/api/model/badge'
import { Contract } from '@/constants'
import { safeParse } from '@/utils/safe-parse'

export async function listBadge({
  scope,
  lower_bound,
  upper_bound,
}: ListBadgeProps): Promise<ListBadgeResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BADGE_DATA,
    scope: scope,
    table: 'badge',
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    json: true,
    limit: 1000,
  })

  rows = rows.map((row) => ({
    ...row,
    offchain_lookup_data: safeParse(row.offchain_lookup_data),
    onchain_lookup_data: safeParse(row.onchain_lookup_data),
  }))

  return {
    rows,
    more,
  }
}
