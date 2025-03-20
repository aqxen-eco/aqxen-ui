import { jungleClient } from '@/api/chain/jungle-client'
import type { ListBadgeStatusResult } from '@/api/model/badge'
import { Contract } from '@/constants'

type ListBadgeProps = {
  scope?: string
}

export async function listBadgeStatus({
  scope,
}: ListBadgeProps): Promise<ListBadgeStatusResult> {
  const { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BOUNDED_AGG,
    scope: scope,
    table: 'badgestatus',
    json: true,
    limit: 1000,
  })

  return {
    rows,
    more,
  }
}
