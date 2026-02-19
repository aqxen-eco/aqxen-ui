import { jungleClient } from '@/api/chain/jungle-client'
import { Contract } from '@/constants'

export type BeamTemplate = {
  badge_suffix: string
  cycle_length: number
  supply_per_cycle: number
  display_name: string
  ipfs_image: string
  description: string
}

export async function listBeamTemplates() {
  const { rows } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BEAMS_MANAGER,
    scope: Contract.BEAMS_MANAGER,
    table: 'beamtempl',
    json: true,
    limit: 100,
  })

  return rows as BeamTemplate[]
}
