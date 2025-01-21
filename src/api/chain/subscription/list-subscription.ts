import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListSubscriptionResult } from '@/api/model/subscription'

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
  let { rows, more } = (await jungleClient.v1.chain.get_table_rows({
    code: 'subyyyyyyyyy',
    scope: scope ?? 'subyyyyyyyyy',
    table: 'packages',
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    json: true,
    limit: 1000,
  })) as ListSubscriptionResult

  rows = rows.sort((a, b) =>
    a.action_size > b.action_size ? 1 : b.action_size > a.action_size ? -1 : 0
  )

  return {
    rows,
    more,
  }
}
