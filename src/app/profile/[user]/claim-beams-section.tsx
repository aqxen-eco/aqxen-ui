'use client'

import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { MdElectricBolt } from 'react-icons/md'
import { toast } from 'react-toastify'

import { listBadge } from '@/api/chain/badge/list-badge'
import { claimBeam } from '@/api/chain/beams/claim-beam'
import {
  type BeamMetadata,
  listBeamMetadata,
} from '@/api/chain/beams/list-beam-metadata'
import { type BeamStats, listBeamStats } from '@/api/chain/beams/list-beam-stats'
import type { Badge } from '@/api/model/badge'
import { BadgeImage } from '@/components/ui/badge-image'
import { Button } from '@/components/ui/button'
import { useChain } from '@/contexts/chain'

function getDisplayName(
  badgeSymbol: string,
  badgesBySymbol: Map<string, Badge>,
) {
  const badge = badgesBySymbol.get(badgeSymbol)
  if (badge) return badge.onchain_lookup_data.user.display_name
  const symbol = badgeSymbol.includes(',')
    ? badgeSymbol.split(',')[1]
    : badgeSymbol
  return symbol.slice(-3).toUpperCase()
}

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

  const stat = stats.find((s) => {
    const statSymbol = s.badge_asset.split(' ')[1]
    return statSymbol === symbol
  })

  if (!stat) return true

  const lastClaimed =
    new Date(`${stat.last_claimed_time}Z`).getTime() / 1000
  return lastClaimed < currentCycleStart
}

type ClaimBeamsSectionProps = {
  user: string
  userOrgNames: string[]
  orgDisplayNames?: Record<string, string>
}

export function ClaimBeamsSection({
  user,
  userOrgNames,
  orgDisplayNames = {},
}: ClaimBeamsSectionProps) {
  const { actor, session } = useChain()
  const queryClient = useQueryClient()
  const [isClaiming, setIsClaiming] = useState(false)

  const isOwnProfile = actor === user

  const metadataQueries = useQueries({
    queries: userOrgNames.map((org) => ({
      queryKey: ['beam-metadata', org],
      queryFn: () => listBeamMetadata({ scope: org }),
      enabled: isOwnProfile,
    })),
  })

  const badgeQueries = useQueries({
    queries: userOrgNames.map((org) => ({
      queryKey: ['badges', org],
      queryFn: () => listBadge({ scope: org }),
      enabled: isOwnProfile,
    })),
  })

  const badgesBySymbol = new Map(
    badgeQueries.flatMap(
      (q) => q.data?.rows.map((b) => [b.badge_symbol, b] as const) ?? [],
    ),
  )

  const { data: stats = [] } = useQuery({
    queryKey: ['beam-stats', user],
    queryFn: () => listBeamStats({ scope: user }),
    enabled: isOwnProfile,
  })

  if (!isOwnProfile) return null

  const isLoading =
    metadataQueries.some((q) => q.isLoading) ||
    badgeQueries.some((q) => q.isLoading)
  if (isLoading) return null

  const orgBeams = userOrgNames
    .map((org, i) => {
      const metadata = metadataQueries[i]?.data ?? []
      const beams = metadata.map((meta) => ({
        ...meta,
        org,
        claimable: isClaimable(meta, stats),
      }))
      return { org, beams }
    })
    .filter(({ beams }) => beams.length > 0)

  const allClaimable = orgBeams.flatMap(({ beams }) =>
    beams.filter((b) => b.claimable)
  )

  if (orgBeams.length === 0) return null

  async function handleClaimAll() {
    if (!session || allClaimable.length === 0) return

    setIsClaiming(true)
    try {
      await claimBeam({
        session,
        badgeSymbols: allClaimable.map((b) => b.badge_symbol),
      })
      toast.success('Beams claimed successfully!')
      await queryClient.invalidateQueries({ queryKey: ['beam-stats'] })
      for (const org of userOrgNames) {
        await queryClient.invalidateQueries({
          queryKey: ['beam-metadata', org],
        })
      }
    } catch (e) {
      console.error('Failed to claim beams', e)
      toast.error('Failed to claim beams. Please try again.')
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <section className="space-y-4 px-8 py-8 max-md:px-4">
      <header className="flex items-center justify-between">
        <h3 className="text-title-2 flex items-center gap-2 text-white">
          <MdElectricBolt className="size-5" />
          Beams
          <span className="text-gray-3 text-body-2 font-normal">
            ({allClaimable.length} available)
          </span>
        </h3>

        {allClaimable.length > 0 && (
          <Button
            variant="primary"
            disabled={isClaiming}
            onClick={handleClaimAll}
          >
            {isClaiming ? 'Claiming...' : 'Claim All Beams'}
          </Button>
        )}
      </header>

      <div className="space-y-4">
        {orgBeams.map(({ org, beams }) => (
          <div key={org}>
            <h4 className="text-body-2 mb-2 font-medium text-white">
              {orgDisplayNames[org] ?? org}
            </h4>
            <div className="flex flex-wrap gap-2">
              {beams.map((beam) => {
                const badge = badgesBySymbol.get(beam.badge_symbol)
                return (
                  <div
                    key={beam.badge_symbol}
                    className={`border-gray-2 flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                      beam.claimable
                        ? 'bg-gray-1 text-white'
                        : 'text-gray-3 bg-transparent'
                    }`}
                  >
                    <BadgeImage
                      src={badge?.offchain_lookup_data.user.ipfs_image}
                      size="xs"
                    />
                    {getDisplayName(beam.badge_symbol, badgesBySymbol)}
                    <span className="text-gray-3">
                      ({beam.supply_per_cycle})
                    </span>
                    <span
                      className={`size-2 rounded-full ${
                        beam.claimable ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
