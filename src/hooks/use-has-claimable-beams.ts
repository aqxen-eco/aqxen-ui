'use client'

import { useQueries, useQuery } from '@tanstack/react-query'

import { listBadge } from '@/api/chain/badge/list-badge'
import {
  type BeamMetadata,
  listBeamMetadata,
} from '@/api/chain/beams/list-beam-metadata'
import { type BeamStats, listBeamStats } from '@/api/chain/beams/list-beam-stats'
import { listBeamTemplates } from '@/api/chain/beams/list-beam-templates'
import { getUserOrganizations } from '@/app/profile/[user]/functions'
import { useChain } from '@/contexts/chain'

function isClaimable(meta: BeamMetadata, stats: BeamStats[]) {
  const now = Date.now() / 1000
  const starttime = new Date(`${meta.starttime}Z`).getTime() / 1000
  const cycleLength = meta.cycle_length

  if (cycleLength <= 0 || now < starttime) return false

  const elapsed = now - starttime
  const currentCycleStart =
    starttime + Math.floor(elapsed / cycleLength) * cycleLength

  const symbol = meta.badge_symbol.includes(',')
    ? meta.badge_symbol.split(',')[1]
    : meta.badge_symbol
  const stat = stats.find((s) => s.badge_asset.split(' ')[1] === symbol)
  if (!stat) return true

  const lastClaimed =
    new Date(`${stat.last_claimed_time}Z`).getTime() / 1000
  return lastClaimed < currentCycleStart
}

export function useHasClaimableBeams() {
  const { actor, isAuthenticated } = useChain()
  const enabled = isAuthenticated && !!actor

  const userOrgsQuery = useQuery({
    queryKey: ['user-organizations', actor],
    queryFn: () => getUserOrganizations({ user: actor! }),
    enabled,
  })

  const orgNames = userOrgsQuery.data?.map((o) => o.org) ?? []

  const metadataQueries = useQueries({
    queries: orgNames.map((org) => ({
      queryKey: ['beam-metadata', org],
      queryFn: () => listBeamMetadata({ scope: org }),
      enabled,
    })),
  })

  const badgeQueries = useQueries({
    queries: orgNames.map((org) => ({
      queryKey: ['badges', org],
      queryFn: () => listBadge({ scope: org }),
      enabled,
    })),
  })

  const { data: stats = [] } = useQuery({
    queryKey: ['beam-stats', actor],
    queryFn: () => listBeamStats({ scope: actor! }),
    enabled,
  })

  const beamTemplatesQuery = useQuery({
    queryKey: ['beam-templates'],
    queryFn: listBeamTemplates,
    enabled,
  })

  const isLoading =
    !enabled ||
    userOrgsQuery.isLoading ||
    metadataQueries.some((q) => q.isLoading) ||
    badgeQueries.some((q) => q.isLoading) ||
    beamTemplatesQuery.isLoading

  if (isLoading) return { hasClaimable: false, isLoading: true }

  const templateNames = new Set(
    beamTemplatesQuery.data?.map((t) => t.display_name) ?? [],
  )

  const badgesBySymbol = new Map(
    badgeQueries.flatMap(
      (q) => q.data?.rows.map((b) => [b.badge_symbol, b] as const) ?? [],
    ),
  )

  const hasClaimable = orgNames.some((_, i) => {
    const metadata = metadataQueries[i]?.data ?? []
    return metadata.some((meta) => {
      const badge = badgesBySymbol.get(meta.badge_symbol)
      if (!badge) return false
      if (!templateNames.has(badge.onchain_lookup_data.user.display_name))
        return false
      return isClaimable(meta, stats)
    })
  })

  return { hasClaimable, isLoading: false }
}
