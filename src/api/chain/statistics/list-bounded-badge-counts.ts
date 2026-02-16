import { Int64 } from '@wharfkit/antelope'

import { jungleClient } from '@/api/chain/jungle-client'
import { Contract } from '@/constants'

export type BoundedBadgeCounts = {
  badge_agg_seq_id: number
  total_recipients: number
  total_issued: number
}

type ListBoundedBadgeCountsProps = {
  scope: string
  badgeAggSeqId: number
}

export async function listBoundedBadgeCounts({
  scope,
  badgeAggSeqId,
}: ListBoundedBadgeCountsProps) {
  const { rows } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BOUNDED_STATS,
    scope: scope,
    table: 'counts',
    lower_bound: Int64.from(badgeAggSeqId),
    upper_bound: Int64.from(badgeAggSeqId),
    json: true,
    limit: 1,
  })

  return (rows as BoundedBadgeCounts[])[0] ?? null
}
