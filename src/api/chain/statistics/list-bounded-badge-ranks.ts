import { jungleClient } from '@/api/chain/jungle-client'
import { Contract } from '@/constants'

import type { BadgeRank } from './list-badge-ranks'

type ListBoundedBadgeRanksProps = {
  badgeAggSeqId: number
  limit?: number
}

export async function listBoundedBadgeRanks({
  badgeAggSeqId,
  limit = 3,
}: ListBoundedBadgeRanksProps) {
  const { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BOUNDED_STATS,
    scope: String(badgeAggSeqId),
    table: 'ranks',
    json: true,
    limit,
  })

  return { rows: rows as BadgeRank[], more }
}
