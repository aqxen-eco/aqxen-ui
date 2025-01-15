import { Name } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import type { ListOrganizationSubscriptionResult } from '@/api/model/subscription'

type ListOrganizationSubscriptionProps = {
  scope: string
  lower_bound?: string
  upper_bound?: string
}

export async function listOrganizationSubscription({
  scope,
  lower_bound,
  upper_bound,
}: ListOrganizationSubscriptionProps): Promise<ListOrganizationSubscriptionResult> {
  const { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: 'subyyyyyyyyy',
    scope,
    table: 'orgpackage',
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    json: true,
    limit: 1000,
  })

  return {
    rows,
    more,
  }
}
