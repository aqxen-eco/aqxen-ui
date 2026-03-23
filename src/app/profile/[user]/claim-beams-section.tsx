'use client'

import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
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
import { listBeamTemplates } from '@/api/chain/beams/list-beam-templates'
import type { Badge } from '@/api/model/badge'
import { BadgeImage } from '@/components/ui/badge-image'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useChain } from '@/contexts/chain'
import { useTranslateBadgeName } from '@/hooks/use-translate-badge-name'

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

function getSymbol(meta: BeamMetadata) {
  return meta.badge_symbol.includes(',')
    ? meta.badge_symbol.split(',')[1]
    : meta.badge_symbol
}

function findStat(meta: BeamMetadata, stats: BeamStats[]) {
  const symbol = getSymbol(meta)
  return stats.find((s) => s.badge_asset.split(' ')[1] === symbol)
}

function isClaimable(meta: BeamMetadata, stats: BeamStats[]) {
  const now = Date.now() / 1000
  const starttime = new Date(`${meta.starttime}Z`).getTime() / 1000
  const cycleLength = meta.cycle_length

  if (cycleLength <= 0 || now < starttime) return false

  const elapsed = now - starttime
  const currentCycleStart =
    starttime + Math.floor(elapsed / cycleLength) * cycleLength

  const stat = findStat(meta, stats)
  if (!stat) return true

  const lastClaimed =
    new Date(`${stat.last_claimed_time}Z`).getTime() / 1000
  return lastClaimed < currentCycleStart
}

function getBalance(meta: BeamMetadata, stats: BeamStats[]) {
  const stat = findStat(meta, stats)
  if (!stat) return 0
  return parseInt(stat.badge_asset.split(' ')[0], 10) || 0
}

function getNextClaimableRaw(meta: BeamMetadata, stats: BeamStats[]) {
  const now = Date.now() / 1000
  const starttime = new Date(`${meta.starttime}Z`).getTime() / 1000
  const cycleLength = meta.cycle_length

  if (cycleLength <= 0 || now < starttime)
    return { key: 'notYetStarted' as const }

  const elapsed = now - starttime
  const currentCycleStart =
    starttime + Math.floor(elapsed / cycleLength) * cycleLength

  const stat = findStat(meta, stats)

  if (!stat) return { key: 'claimableNow' as const }

  const lastClaimed =
    new Date(`${stat.last_claimed_time}Z`).getTime() / 1000

  if (lastClaimed < currentCycleStart)
    return { key: 'claimableNow' as const }

  const nextCycleStart = currentCycleStart + cycleLength
  const secondsUntil = Math.max(0, Math.round(nextCycleStart - now))

  if (secondsUntil < 60)
    return { key: 'claimableInSeconds' as const, count: secondsUntil }
  if (secondsUntil < 3600)
    return {
      key: 'claimableInMinutes' as const,
      count: Math.ceil(secondsUntil / 60),
    }
  if (secondsUntil < 86400)
    return {
      key: 'claimableInHours' as const,
      count: Math.ceil(secondsUntil / 3600),
    }
  return {
    key: 'claimableInDays' as const,
    count: Math.ceil(secondsUntil / 86400),
  }
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
  const t = useTranslations('profile')
  const translateBadgeName = useTranslateBadgeName()
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

  const beamTemplatesQuery = useQuery({
    queryKey: ['beam-templates'],
    queryFn: listBeamTemplates,
    enabled: isOwnProfile,
  })

  if (!isOwnProfile) return null

  const isLoading =
    metadataQueries.some((q) => q.isLoading) ||
    badgeQueries.some((q) => q.isLoading) ||
    beamTemplatesQuery.isLoading
  if (isLoading) return null

  const templateNames = new Set(
    beamTemplatesQuery.data?.map((t) => t.display_name) ?? [],
  )

  const orgBeams = userOrgNames
    .map((org, i) => {
      const metadata = metadataQueries[i]?.data ?? []
      const beams = metadata
        .filter((meta) => {
          const badge = badgesBySymbol.get(meta.badge_symbol)
          if (!badge) return false
          return templateNames.has(
            badge.onchain_lookup_data.user.display_name,
          )
        })
        .map((meta) => ({
          ...meta,
          org,
          claimable: isClaimable(meta, stats),
          balance: getBalance(meta, stats),
          nextClaimableLabel: (() => {
            const raw = getNextClaimableRaw(meta, stats)
            if ('count' in raw && raw.count !== undefined)
              return t(raw.key, { count: raw.count })
            return t(raw.key)
          })(),
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
      toast.success(t('claimSuccess'))
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['beam-stats'] })
      for (const org of userOrgNames) {
        await queryClient.invalidateQueries({
          queryKey: ['beam-metadata', org],
        })
        await queryClient.invalidateQueries({
          queryKey: ['badges', org],
        })
      }
    } catch (e) {
      console.error('Failed to claim beams', e)
      toast.error(t('claimFailed'))
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <section className="space-y-4 px-8 py-8 max-md:px-4">
      <header className="flex items-center justify-between">
        <h3 className="text-title-2 flex items-center gap-2 text-white">
          <MdElectricBolt className="size-5" />
          {t('claimBeamsTitle')}
        </h3>

        {allClaimable.length > 0 && (
          <Button
            variant="primary"
            disabled={isClaiming}
            onClick={handleClaimAll}
          >
            {isClaiming ? t('claiming') : t('claimAll')}
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
                  <Tooltip
                    key={beam.badge_symbol}
                    content={beam.nextClaimableLabel}
                  >
                    <div
                      className={`border-gray-2 flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                        beam.claimable
                          ? 'bg-gray-1 text-white'
                          : 'text-gray-3 bg-transparent'
                      }`}
                    >
                      <BadgeImage
                        src={badge?.offchain_lookup_data.user.ipfs_image}
                        size="xs"
                        badgeSymbol={beam.badge_symbol}
                        displayName={badge?.onchain_lookup_data.user.display_name}
                      />
                      {translateBadgeName(getDisplayName(beam.badge_symbol, badgesBySymbol))}
                    </div>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
