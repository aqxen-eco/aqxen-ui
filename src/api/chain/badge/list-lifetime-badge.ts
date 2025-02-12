import { jungleClient } from '@/api/chain/jungle-client'
import type { ListLifetimeBadgeResult } from '@/api/model/badge'

type ListLifetimeBadgeProps = {
  scope?: string
}

export async function listLifetimeBadge({
  scope,
}: ListLifetimeBadgeProps): Promise<ListLifetimeBadgeResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: 'cumulativeyy',
    scope: scope,
    table: 'accounts',
    json: true,
    limit: 1000,
  })

  return {
    rows,
    more,
  }
}
