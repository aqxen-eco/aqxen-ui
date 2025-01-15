import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListSeasonResult } from '@/api/model/season'
import { SEASONS_INFO_CONTRACT, Table } from '@/constants'

type ListSeasonProps = {
  scope?: string
  lower_bound?: string
  upper_bound?: string
  organization_symbol?: string
}

export async function listSeason({
  scope,
  lower_bound,
  upper_bound,
  organization_symbol,
}: ListSeasonProps): Promise<ListSeasonResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: SEASONS_INFO_CONTRACT,
    scope: scope,
    table: Table.AGGREGATES,
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    json: true,
    limit: 1000,
  })

  rows = rows.map((row) => ({
    id: row.agg_symbol,
    symbol: row.agg_symbol
      .split(',')[1]
      .replace(organization_symbol?.toUpperCase(), ''),
    name: row.agg_description,
    badges: row.init_badge_symbols,
    last_created_series: row.init_seq_ids,
    last_started_series: row.active_seq_ids,
    last_ended_series: row.end_seq_ids,
  }))

  return {
    rows,
    more,
  }
}
