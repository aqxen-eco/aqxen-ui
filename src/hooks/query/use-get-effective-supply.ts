import { useQuery } from '@tanstack/react-query'

import { type BeamMetadata } from '@/api/chain/beams/list-beam-metadata'
import {
  getEffectiveSupply,
  listBeamSupplyConfig,
} from '@/api/chain/beams/list-beam-supply-config'
import { listMembers } from '@/api/chain/organization/list-members'

export function useGetEffectiveSupply({
  orgScope,
  beams,
}: {
  orgScope: string
  beams: BeamMetadata[]
}) {
  return useQuery({
    queryKey: ['beam-effective-supply', orgScope],
    queryFn: async () => {
      const [supplyConfig, memberResult] = await Promise.all([
        listBeamSupplyConfig(),
        listMembers({ scope: orgScope }),
      ])
      const memberCount = memberResult.rows.length
      const result = new Map<string, number>()
      for (const beam of beams) {
        const symbolName = beam.badge_symbol.includes(',')
          ? beam.badge_symbol.split(',')[1]
          : beam.badge_symbol
        result.set(
          symbolName,
          getEffectiveSupply(
            supplyConfig,
            memberCount,
            beam.supply_per_cycle,
          ),
        )
      }
      return result
    },
    enabled: !!orgScope && beams.length > 0,
  })
}
