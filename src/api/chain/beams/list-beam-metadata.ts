import { jungleClient } from '@/api/chain/jungle-client'
import { Contract } from '@/constants'

export type BeamMetadata = {
  badge_symbol: string
  starttime: string
  cycle_length: number
  last_known_cycle_start: string
  last_known_cycle_end: string
  supply_per_cycle: number
}

export async function listBeamMetadata({ scope }: { scope: string }) {
  const { rows } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BEAMS,
    scope,
    table: 'metadata',
    json: true,
    limit: 100,
  })

  return rows as BeamMetadata[]
}
