import { jungleClient } from '@/api/chain/jungle-client'
import type { ListBadgeAutomationResult } from '@/api/model/badge-automation'

type ListBadgeAutomationProps = {
  scope?: string
}

export async function listBadgeAutomation({
  scope,
}: ListBadgeAutomationProps): Promise<ListBadgeAutomationResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: 'andemitteryy',
    scope: scope,
    table: 'emissions',
    json: true,
    limit: 1000,
  })

  rows = rows.map((row) => ({
    emission_symbol: row.emission_symbol,
    emitter_criteria: row.emitter_criteria,
    emit_assets: row.emit_assets,
    status: row.status,
    cyclic: Boolean(row.cyclic),
  }))

  return {
    rows,
    more,
  } as ListBadgeAutomationResult
}
