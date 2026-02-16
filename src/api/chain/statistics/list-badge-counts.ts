import { jungleClient } from '@/api/chain/jungle-client'
import { Contract } from '@/constants'

export type BadgeCounts = {
  badge_symbol: string
  total_recipients: number
  total_issued: number
}

type ListBadgeCountsProps = {
  scope: string
}

export async function listBadgeCounts({ scope }: ListBadgeCountsProps) {
  const { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.STATISTICS,
    scope: scope,
    table: 'counts',
    json: true,
    limit: 1000,
  })

  return { rows: rows as BadgeCounts[], more }
}
