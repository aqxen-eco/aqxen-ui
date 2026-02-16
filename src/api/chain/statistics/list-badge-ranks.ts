import { jungleClient } from '@/api/chain/jungle-client'
import { Contract } from '@/constants'

export type BadgeRank = {
  accounts: string[]
  balance: number
}

type ListBadgeRanksProps = {
  badgeSymbol: string
  limit?: number
}

export async function listBadgeRanks({
  badgeSymbol,
  limit = 3,
}: ListBadgeRanksProps) {
  const scope = badgeSymbol.replace(/^\d+,/, '')

  const { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.STATISTICS,
    scope: scope,
    table: 'ranks',
    json: true,
    limit,
  })

  return { rows: rows as BadgeRank[], more }
}
