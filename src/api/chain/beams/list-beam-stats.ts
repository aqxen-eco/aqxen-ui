import { jungleClient } from '@/api/chain/jungle-client'
import { Contract } from '@/constants'

export type BeamStats = {
  badge_asset: string
  org: string
  last_claimed_time: string
}

export async function listBeamStats({ scope }: { scope: string }) {
  const { rows } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BEAMS,
    scope,
    table: 'stats',
    json: true,
    limit: 100,
  })

  return rows as BeamStats[]
}
