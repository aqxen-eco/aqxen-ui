import { jungleClient } from '@/api/chain/jungle-client'
import type { ListUserBadgeResult } from '@/api/model/badge'

type ListUserBadgeProps = {
  scope?: string
}

export async function listUserBadge({
  scope,
}: ListUserBadgeProps): Promise<ListUserBadgeResult> {
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
