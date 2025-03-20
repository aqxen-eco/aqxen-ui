import { jungleClient } from '@/api/chain/jungle-client'
import type { ListBadgeAutomationResult } from '@/api/model/badge-automation'
import { Contract } from '@/constants'
import { safeParse } from '@/utils/safe-parse'

type ListBadgeAutomationProps = {
  scope?: string
}

export async function listBadgeAutomation({
  scope,
}: ListBadgeAutomationProps): Promise<ListBadgeAutomationResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.ANDEMITTER,
    scope: scope,
    table: 'emissions',
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
