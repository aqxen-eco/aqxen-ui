import { jungleClient } from '@/api/chain/jungle-client'
import type { ListSeasonalBadgeResult } from '@/api/model/badge'

type ListSeasonalProps = {
  scope?: string
}

export async function listSeasonalBadge({
  scope,
}: ListSeasonalProps): Promise<ListSeasonalBadgeResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: 'baggyyyyyyyy',
    scope: scope,
    table: 'achievements',
    json: true,
    limit: 1000,
  })

  return {
    rows,
    more,
  }
}
