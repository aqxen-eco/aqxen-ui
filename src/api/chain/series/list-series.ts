import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListSeriesResult } from '@/api/model/series'

type ListSeriesProps = {
  scope?: string
  lower_bound?: string
  upper_bound?: string
}

export async function listSeries({
  scope,
  lower_bound,
  upper_bound,
}: ListSeriesProps): Promise<ListSeriesResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: 'baggyyyyyyyy',
    scope: scope,
    table: 'sequence',
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    json: true,
    limit: 1000,
  })

  rows = rows.map((row) => ({
    id: row.seq_id,
    status: row.seq_status,
    name: row.sequence_description,
    init_time: row.init_time,
    active_time: row.active_time,
    end_time: row.end_time,
  }))

  return {
    rows,
    more,
  }
}
