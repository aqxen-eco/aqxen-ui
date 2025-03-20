import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListSubscriptionResult } from '@/api/model/subscription'
import { Contract } from '@/constants'

type ListSubscriptionProps = {
  scope?: string
  lower_bound?: string
  upper_bound?: string
}

export async function listSubscription({
  scope,
  lower_bound,
  upper_bound,
}: ListSubscriptionProps = {}): Promise<ListSubscriptionResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.SUBSCRIPTION,
    scope: scope ?? Contract.SUBSCRIPTION,
    table: 'packages',
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    json: true,
    limit: 1000,
  })

  rows = rows.sort((a, b) => {
    const quantityA = parseFloat(a.cost.quantity)
    const quantityB = parseFloat(b.cost.quantity)
    return quantityA - quantityB
  })

  return {
    rows,
    more,
  }
}
