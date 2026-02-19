'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { listBadge } from '@/api/chain/badge/list-badge'
import { enableBeams } from '@/api/chain/beams/enable-beams'
import {
  type BeamMetadata,
  listBeamMetadata,
} from '@/api/chain/beams/list-beam-metadata'
import { listBeamTemplates } from '@/api/chain/beams/list-beam-templates'
import type { Badge } from '@/api/model/badge'
import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { TableSkeleton } from '@/components/skeleton'
import { BadgeDetailModal } from '@/components/ui/badge-detail-modal'
import { BadgeImage } from '@/components/ui/badge-image'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

function formatCycleLength(seconds: number) {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''}`
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  const minutes = Math.floor(seconds / 60)
  return `${minutes} min${minutes !== 1 ? 's' : ''}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function BeamsTable({
  beams,
  badgesBySymbol,
  removeOrganizationSymbol,
  onSelectBadge,
}: {
  beams: BeamMetadata[]
  badgesBySymbol: Map<string, Badge>
  removeOrganizationSymbol: (value: string) => string
  onSelectBadge: (badge: Badge) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Sym</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>Cycle Length</TableHead>
          <TableHead className="w-32 text-center">Supply / Cycle</TableHead>
          <TableHead className="w-28" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {beams.map((row) => {
          const badge = badgesBySymbol.get(row.badge_symbol)
          return (
            <TableRow key={row.badge_symbol}>
              <TableCell className="text-gray-3">
                {removeOrganizationSymbol(row.badge_symbol)}
              </TableCell>
              <TableCell>
                {badge ? (
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-2"
                    onClick={() => onSelectBadge(badge)}
                  >
                    <BadgeImage
                      src={badge.offchain_lookup_data.user.ipfs_image}
                      size="xs"
                    />
                    <span className="text-body-2 font-sans font-medium text-nowrap text-white hover:underline">
                      {badge.onchain_lookup_data.user.display_name}
                    </span>
                  </button>
                ) : (
                  <span className="text-gray-3">-</span>
                )}
              </TableCell>
              <TableCell>{formatDate(row.starttime)}</TableCell>
              <TableCell>{formatCycleLength(row.cycle_length)}</TableCell>
              <TableCell className="text-center">
                {row.supply_per_cycle}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {badge && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => onSelectBadge(badge)}
                    >
                      Details
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default function BeamsPage() {
  const { session } = useChain()
  const { name, symbol, removeOrganizationSymbol } = useOrganization()
  const queryClient = useQueryClient()
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [isEnabling, setIsEnabling] = useState(false)

  const beamsQuery = useQuery({
    queryKey: ['beams', name],
    queryFn: async () => await listBeamMetadata({ scope: name }),
  })

  const badgesQuery = useQuery({
    queryKey: ['badges', name],
    queryFn: async () => await listBadge({ scope: name }),
  })

  const templatesQuery = useQuery({
    queryKey: ['beam-templates'],
    queryFn: listBeamTemplates,
  })

  const isLoading = beamsQuery.isLoading || badgesQuery.isLoading
  const isSuccess = beamsQuery.isSuccess && badgesQuery.isSuccess

  const templateSuffixes = new Set(
    templatesQuery.data?.map((t) => t.badge_suffix) ?? [],
  )

  const systemBeams =
    beamsQuery.data?.filter((b) => {
      const suffix = removeOrganizationSymbol(b.badge_symbol)
      return templateSuffixes.has(suffix)
    }) ?? []

  const existingSymbols = new Set(
    beamsQuery.data?.map((b) => b.badge_symbol) ?? [],
  )
  const templatesFailed = templatesQuery.isError
  const hasUnenabledTemplates =
    templatesQuery.isSuccess &&
    templatesQuery.data.length > 0 &&
    templatesQuery.data.some(
      (t) =>
        !existingSymbols.has(
          `0,${(symbol + t.badge_suffix).toUpperCase()}`,
        ),
    )
  const needsEnableBeams = hasUnenabledTemplates || templatesFailed

  const badgesBySymbol = new Map(
    badgesQuery.data?.rows.map((b) => [b.badge_symbol, b]) ?? [],
  )

  async function handleEnableBeams() {
    if (!session) return

    setIsEnabling(true)
    try {
      const fiveMinFromNow = new Date(Date.now() + 5 * 60 * 1000)
      const starttime = fiveMinFromNow
        .toISOString()
        .replace(/\.\d{3}Z$/, '')
      await enableBeams({ session, starttime })
      toast.success('Beams enabled successfully!')
      await queryClient.refetchQueries({ queryKey: ['beams', name] })
      await queryClient.refetchQueries({ queryKey: ['badges', name] })
    } catch (e) {
      console.error('Failed to enable beams', e)
      toast.error('Failed to enable beams')
    } finally {
      setIsEnabling(false)
    }
  }

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/beams" />
        <HeaderAdminTitle
          title="Beams"
          tooltip="Cycle-based badge distribution"
        />
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] space-y-10 px-4 pb-8">
        {isLoading && <TableSkeleton />}

        {isSuccess && (
          <>
            <section className="space-y-4">
              <h2 className="text-title-2 text-white">System Beams</h2>
              {needsEnableBeams && (
                <div className="space-y-6">
                  <p className="text-body-2 text-gray-3">
                    Enable beams to create all template badges for your
                    organization.
                  </p>
                  {hasUnenabledTemplates && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Suffix</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Cycle Length</TableHead>
                          <TableHead className="text-center">
                            Supply / Cycle
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templatesQuery.data!.map((t) => (
                          <TableRow key={t.badge_suffix}>
                            <TableCell className="text-gray-3">
                              {t.badge_suffix}
                            </TableCell>
                            <TableCell>
                              {t.display_name}
                            </TableCell>
                            <TableCell>
                              {formatCycleLength(t.cycle_length)}
                            </TableCell>
                            <TableCell className="text-center">
                              {t.supply_per_cycle}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    disabled={isEnabling || !session}
                    onClick={handleEnableBeams}
                  >
                    {isEnabling ? 'Enabling...' : 'Enable Beams'}
                  </Button>
                </div>
              )}
              {!needsEnableBeams && systemBeams.length > 0 && (
                <BeamsTable
                  beams={systemBeams}
                  badgesBySymbol={badgesBySymbol}
                  removeOrganizationSymbol={removeOrganizationSymbol}
                  onSelectBadge={setSelectedBadge}
                />
              )}
              {!needsEnableBeams && systemBeams.length === 0 && (
                <p className="text-body-2 text-gray-3">
                  No system beams.
                </p>
              )}
            </section>
          </>
        )}
      </div>
      <BadgeDetailModal
        open={!!selectedBadge}
        onOpenChange={(open) => {
          if (!open) setSelectedBadge(null)
        }}
        badgeSymbol={selectedBadge?.badge_symbol ?? ''}
        scope={name}
        badge={selectedBadge ?? undefined}
      />
    </>
  )
}
