import { jungleClient } from '@/api/chain/jungle-client'
import { Contract } from '@/constants'

export type BeamSupplyConfig = {
  member_count: number
  supply: number
}

export async function listBeamSupplyConfig() {
  const { rows } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.BEAMS,
    scope: Contract.BEAMS,
    table: 'supplycfg',
    json: true,
    limit: 100,
  })

  return rows as BeamSupplyConfig[]
}

export function getEffectiveSupply(
  supplyConfig: BeamSupplyConfig[],
  memberCount: number,
  defaultSupply: number,
) {
  if (supplyConfig.length === 0) return defaultSupply

  const sorted = [...supplyConfig].sort(
    (a, b) => a.member_count - b.member_count,
  )
  const tier = sorted.find((t) => t.member_count >= memberCount)
  return tier ? tier.supply : sorted[sorted.length - 1].supply
}
