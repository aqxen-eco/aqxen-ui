import { jungleClient } from '@/api/chain/jungle-client'
import type {
  GetBillingDetailProps,
  GetBillingDetailResult,
} from '@/api/model/billing'
import { Contract } from '@/constants'

export async function getBillingDetail({
  session,
}: GetBillingDetailProps): Promise<GetBillingDetailResult> {
  const organizationName = session.actor.toString()

  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BILLING,
    scope: organizationName,
    table: 'billdetails',
    json: true,
    limit: 1000,
  })

  return {
    rows,
    more,
  }
}
