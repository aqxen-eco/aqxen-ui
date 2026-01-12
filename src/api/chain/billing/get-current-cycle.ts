import { jungleClient } from '@/api/chain/jungle-client'
import type { GetCurrentCycleResult } from '@/api/model/billing'
import { Contract } from '@/constants'

export async function getCurrentCycle(): Promise<GetCurrentCycleResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BILLING,
    scope: Contract.BILLING,
    table: 'currentcycle',
    json: true,
    limit: 1000,
  })

  return {
    rows,
    more,
  }
}
