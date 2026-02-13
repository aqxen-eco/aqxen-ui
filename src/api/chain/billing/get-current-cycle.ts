import type { UInt64 } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { Cycle } from '@/api/model/cycle'
import { Contract } from '@/constants'

export async function getCurrentCycle(): Promise<UInt64 | null> {
  const { rows } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BILLING,
    scope: Contract.BILLING,
    table: 'billcycles',
    json: true,
    limit: 1000,
  })

  const nowMs = Date.now()

  const current = (rows as Cycle[]).find((cycle) => {
    const start = new Date(`${cycle.start_time}Z`).getTime()
    const end = new Date(`${cycle.end_time}Z`).getTime()
    return nowMs >= start && nowMs <= end
  })

  return current?.bill_cycle_id ?? null
}
