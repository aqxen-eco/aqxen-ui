'use client'

import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
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
import { useGetEffectiveSupply } from '@/hooks/query/use-get-effective-supply'
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

function findStat(meta: BeamMetadata, stats: BeamStats[], org: string) {
  const symbol = getSymbol(meta)
  return stats.find(
    (s) => s.org === org && s.badge_asset.split(' ')[1] === symbol,
  )
}

function isClaimable(meta: BeamMetadata, stats: BeamStats[], org: string) {
  const now = Date.now() / 1000
  const starttime = new Date(`${meta.starttime}Z`).getTime() / 1000
  const cycleLength = meta.cycle_length

  if (cycleLength <= 0 || now < starttime) return false

  const elapsed = now - starttime
  const currentCycleStart =
    starttime + Math.floor(elapsed / cycleLength) * cycleLength

  const stat = findStat(meta, stats, org)
  if (!stat) return true

  const lastClaimed =
    new Date(`${stat.last_claimed_time}Z`).getTime() / 1000
  return lastClaimed < currentCycleStart
}

function getBalance(meta: BeamMetadata, stats: BeamStats[], org: string) {
  const stat = findStat(meta, stats, org)
  if (!stat) return 0
  return parseInt(stat.badge_asset.split(' ')[0], 10) || 0
}

function getNextCycleStart(meta: BeamMetadata): number | null {
  const now = Date.now() / 1000
  const starttime = new Date(`${meta.starttime}Z`).getTime() / 1000
  const cycleLength = meta.cycle_length

  if (cycleLength <= 0) return null
  if (now < starttime) return starttime

  const elapsed = now - starttime
  const currentCycleStart =
    starttime + Math.floor(elapsed / cycleLength) * cycleLength
  return currentCycleStart + cycleLength
}

type OrgBeam = BeamMetadata & {
  org: string
  claimable: boolean
  balance: number
  nextClaimableLabel: string
}

function OrgBeamsGroup({
  org,
  displayName,
  beams,
  metadata,
  badgesBySymbol,
  nextCycleStart,
}: {
  org: string
  displayName: string
  beams: OrgBeam[]
  metadata: BeamMetadata[]
  badgesBySymbol: Map<string, Badge>
  nextCycleStart: number | null
}) {
  const t = useTranslations('profile')
  const translateBadgeName = useTranslateBadgeName()
  const { data: effectiveSupplyMap } = useGetEffectiveSupply({
    orgScope: org,
    beams: metadata,
  })

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-body-2 font-medium text-white">{displayName}</h4>
        {nextCycleStart !== null && (
          <span className="text-body-2 text-gray-3">
            {t('nextCycleIn')} <CountdownTimer target={nextCycleStart} />
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {beams.map((beam) => {
          const badge = badgesBySymbol.get(beam.badge_symbol)
          const symbolName = getSymbol(beam)
          const supply = effectiveSupplyMap?.get(symbolName) ?? 0
          const balance = beam.claimable ? 0 : beam.balance
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
                {translateBadgeName(
                  getDisplayName(beam.badge_symbol, badgesBySymbol),
                )}
                <span className="text-gray-3 ml-1">
                  {balance} / {supply}
                </span>
              </div>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}

function CountdownTimer({ target }: { target: number }) {
  const [now, setNow] = useState(() => Date.now() / 1000)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() / 1000), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = Math.max(0, Math.floor(target - now))
  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <span className="tabular-nums">
      {days > 0 ? `${days}d ` : ''}
      {`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}
    </span>
  )
}

function getNextClaimableRaw(
  meta: BeamMetadata,
  stats: BeamStats[],
  org: string,
) {
  const now = Date.now() / 1000
  const starttime = new Date(`${meta.starttime}Z`).getTime() / 1000
  const cycleLength = meta.cycle_length

  if (cycleLength <= 0 || now < starttime)
    return { key: 'notYetStarted' as const }

  const elapsed = now - starttime
  const currentCycleStart =
    starttime + Math.floor(elapsed / cycleLength) * cycleLength

  const stat = findStat(meta, stats, org)

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
  const { actor, session } = useChain()
  const queryClient = useQueryClient()
  const [isClaiming, setIsClaiming] = useState(false)
  const [, setTick] = useState(0)

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

  const isLoading =
    metadataQueries.some((q) => q.isLoading) ||
    badgeQueries.some((q) => q.isLoading) ||
    beamTemplatesQuery.isLoading

  const templateNames = new Set(
    beamTemplatesQuery.data?.map((t) => t.display_name) ?? [],
  )

  const orgBeams = userOrgNames
    .map((org, i) => {
      const metadata = metadataQueries[i]?.data ?? []
      const filteredMetadata = metadata.filter((meta) => {
        const badge = badgesBySymbol.get(meta.badge_symbol)
        if (!badge) return false
        return templateNames.has(
          badge.onchain_lookup_data.user.display_name,
        )
      })
      const beams = filteredMetadata.map((meta) => ({
        ...meta,
        org,
        claimable: isClaimable(meta, stats, org),
        balance: getBalance(meta, stats, org),
        nextClaimableLabel: (() => {
          const raw = getNextClaimableRaw(meta, stats, org)
          if ('count' in raw && raw.count !== undefined)
            return t(raw.key, { count: raw.count })
          return t(raw.key)
        })(),
      }))
      const nextCycleTimes = filteredMetadata
        .map(getNextCycleStart)
        .filter((v): v is number => v !== null)
      const nextCycleStart =
        nextCycleTimes.length > 0 ? Math.min(...nextCycleTimes) : null
      return { org, beams, metadata: filteredMetadata, nextCycleStart }
    })
    .filter(({ beams }) => beams.length > 0)

  const earliestNextCycle = orgBeams.reduce<number | null>(
    (min, { nextCycleStart }) =>
      nextCycleStart !== null && (min === null || nextCycleStart < min)
        ? nextCycleStart
        : min,
    null,
  )

  useEffect(() => {
    if (earliestNextCycle === null) return
    const nowSec = Date.now() / 1000
    const delayMs = Math.max(0, (earliestNextCycle - nowSec) * 1000) + 100
    const id = setTimeout(() => setTick((v) => v + 1), delayMs)
    return () => clearTimeout(id)
  }, [earliestNextCycle])

  if (!isOwnProfile) return null
  if (isLoading) return null

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
        {orgBeams.map(({ org, beams, metadata, nextCycleStart }) => (
          <OrgBeamsGroup
            key={org}
            org={org}
            displayName={orgDisplayNames[org] ?? org}
            beams={beams}
            metadata={metadata}
            badgesBySymbol={badgesBySymbol}
            nextCycleStart={nextCycleStart}
          />
        ))}
      </div>
    </section>
  )
}
