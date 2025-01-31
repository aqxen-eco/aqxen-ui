import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListBadgeResult } from '@/api/model/badge'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { safeParse } from '@/utils/safe-parse'

type ListBadgeProps = {
  scope?: string
  lower_bound?: string
  upper_bound?: string
  organization_symbol?: string
}

export async function listBadge({
  scope,
  lower_bound,
  upper_bound,
  organization_symbol,
}: ListBadgeProps): Promise<ListBadgeResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: 'orchyyyyyyyy',
    scope: scope,
    table: 'badge',
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    json: true,
    limit: 1000,
  })

  rows = rows.map((row) => ({
    id: row.badge_symbol,
    symbol: row.badge_symbol
      .split(',')[1]
      .replace(organization_symbol?.toUpperCase(), ''),
    ipfs: IPFS_IMAGE_SOURCE + safeParse(row.offchain_lookup_data).img,
    name: safeParse(row.onchain_lookup_data).name,
    notify_accounts: row.notify_accounts,
    rarity_counts: row.rarity_counts,
  }))

  return {
    rows,
    more,
  }
}
