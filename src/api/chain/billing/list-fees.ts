import { jungleClient } from '@/api/chain/jungle-client'
import type { ListFeesResult } from '@/api/model/billing'
import { Contract } from '@/constants'

export async function listFees(): Promise<ListFeesResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BILLING,
    scope: Contract.BILLING,
    table: 'fees',
    json: true,
    limit: 1000,
  })

  return {
    rows,
    more,
  }
}
