import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListCycleResult } from '@/api/model/cycle'
import { Contract } from '@/constants'

type ListCycleProps = {
  lower_bound?: string
  upper_bound?: string
}

export async function listCycle({
  lower_bound,
  upper_bound,
}: ListCycleProps): Promise<ListCycleResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BILLING,
    scope: Contract.BILLING,
    table: 'billcycles',
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    json: true,
    limit: 100,
    reverse: true,
  })

  return {
    rows,
    more,
  }
}
