import { Int64 } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListSeasonProps, ListSeasonResult } from '@/api/model/season'
import { Contract } from '@/constants'
import { safeParse } from '@/utils/safe-parse'

export async function listSeason({
  scope,
  lower_bound,
  upper_bound,
}: ListSeasonProps): Promise<ListSeasonResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BOUNDED_AGG,
    scope: scope,
    table: 'aggdetails',
    key_type: 'i64',
    lower_bound: lower_bound ? (lower_bound as unknown as Int64) : undefined,
    upper_bound: upper_bound ? (upper_bound as unknown as Int64) : undefined,
    json: true,
    limit: 1000,
  })

  rows = rows
    .map((row) => ({
      ...row,
      offchain_lookup_data: safeParse(row.offchain_lookup_data),
      onchain_lookup_data: safeParse(row.onchain_lookup_data),
    }))
    .sort((a, b) => {
      const dateA = a.onchain_lookup_data?.system?.created_at || 0
      const dateB = b.onchain_lookup_data?.system?.created_at || 0
      return dateB - dateA
    })

  return {
    rows,
    more,
  }
}
