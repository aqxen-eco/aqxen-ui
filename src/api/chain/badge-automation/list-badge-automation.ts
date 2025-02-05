import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListBadgeAutomationResult } from '@/api/model/badge-automation'
import { BADGES_INFO_CONTRACT, IPFS_IMAGE_SOURCE, Table } from '@/constants'
import { safeParse } from '@/utils/safe-parse'

type ListBadgeAutomationProps = {
  scope?: string
  lower_bound?: string
  upper_bound?: string
  organization_symbol?: string
}

export async function listBadgeAutomation({
  scope,
  lower_bound,
  upper_bound,
  organization_symbol,
}: ListBadgeAutomationProps): Promise<ListBadgeAutomationResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: BADGES_INFO_CONTRACT,
    scope: scope,
    table: Table.BADGE,
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
