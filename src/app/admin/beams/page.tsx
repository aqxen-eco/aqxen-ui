'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { MdClose } from 'react-icons/md'
import { toast } from 'react-toastify'

import { listBadge } from '@/api/chain/badge/list-badge'
import { enableBeams } from '@/api/chain/beams/enable-beams'
import {
  type BeamMetadata,
  listBeamMetadata,
} from '@/api/chain/beams/list-beam-metadata'
import { listBeamTemplates } from '@/api/chain/beams/list-beam-templates'
import { setCycleLength } from '@/api/chain/beams/set-cycle-length'
import { setCycleSupply } from '@/api/chain/beams/set-cycle-supply'
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
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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

function EditBeamModal({
  beam,
  badge,
  open,
  onOpenChange,
  onSave,
}: {
  beam: BeamMetadata | null
  badge: Badge | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    badgeSymbol: string,
    cycleLength: number,
    supplyPerCycle: number
  ) => Promise<void>
}) {
  const [cycleLength, setCycleLengthValue] = useState('')
  const [supplyPerCycle, setSupplyPerCycle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (beam && open) {
      setCycleLengthValue(String(beam.cycle_length))
      setSupplyPerCycle(String(beam.supply_per_cycle))
      setError('')
    }
  }, [beam, open])

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
  }

  async function handleSave() {
    const cl = parseInt(cycleLength)
    const spc = parseInt(supplyPerCycle)
    if (!cl || cl <= 0) {
      setError('Cycle length must be a positive number')
      return
    }
    if (!spc || spc <= 0) {
      setError('Supply per cycle must be a positive number')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      await onSave(beam!.badge_symbol, cl, spc)
      onOpenChange(false)
    } catch {
      setError('Failed to update beam settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50"
              />
            </Dialog.Overlay>
            <Dialog.Content forceMount asChild>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 32 }}
                className="border-gray-2 bg-gray-1 fixed top-1/2 left-1/2 z-60 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-lg"
              >
                <Dialog.Close asChild>
                  <Button
                    size="md"
                    variant="link"
                    square
                    className="absolute top-4 right-4"
                  >
                    <MdClose className="size-6" />
                  </Button>
                </Dialog.Close>
                <Dialog.Title className="text-title-2 text-white">
                  Edit Beam
                </Dialog.Title>
                {badge && (
                  <div className="mt-2 flex items-center gap-2">
                    <BadgeImage
                      src={badge.offchain_lookup_data.user.ipfs_image}
                      size="xs"
                      badgeSymbol={badge.badge_symbol}
                      displayName={badge.onchain_lookup_data.user.display_name}
                    />
                    <span className="text-body-2 text-gray-3">
                      {badge.onchain_lookup_data.user.display_name}
                    </span>
                  </div>
                )}
                <div className="mt-6 space-y-4">
                  <Field>
                    <Label htmlFor="edit-cycle-length">
                      Cycle Length (seconds)
                    </Label>
                    <Input
                      id="edit-cycle-length"
                      type="number"
                      min={1}
                      value={cycleLength}
                      onChange={(e) => setCycleLengthValue(e.target.value)}
                      disabled={isSaving}
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="edit-supply">Supply / Cycle</Label>
                    <Input
                      id="edit-supply"
                      type="number"
                      min={1}
                      max={255}
                      value={supplyPerCycle}
                      onChange={(e) => setSupplyPerCycle(e.target.value)}
                      disabled={isSaving}
                    />
                  </Field>
                  {error && <ErrorMessage>{error}</ErrorMessage>}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isSaving}
                    onClick={handleSave}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

function BeamsTable({
  beams,
  badgesBySymbol,
  removeOrganizationSymbol,
  onSelectBadge,
  onEditBeam,
}: {
  beams: BeamMetadata[]
  badgesBySymbol: Map<string, Badge>
  removeOrganizationSymbol: (value: string) => string
  onSelectBadge: (badge: Badge) => void
  onEditBeam: (beam: BeamMetadata) => void
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
                      badgeSymbol={badge.badge_symbol}
                      displayName={badge.onchain_lookup_data.user.display_name}
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
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => onEditBeam(row)}
                  >
                    Edit
                  </Button>
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
  const [editingBeam, setEditingBeam] = useState<BeamMetadata | null>(null)
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

  async function handleSaveBeam(
    badgeSymbol: string,
    newCycleLength: number,
    newSupplyPerCycle: number
  ) {
    if (!session) return

    const currentBeam = beamsQuery.data?.find(
      (b) => b.badge_symbol === badgeSymbol
    )

    const actions: Promise<void>[] = []
    if (currentBeam && newCycleLength !== currentBeam.cycle_length) {
      actions.push(
        setCycleLength({
          session,
          badge_symbol: badgeSymbol,
          new_cycle_length: newCycleLength,
        })
      )
    }
    if (currentBeam && newSupplyPerCycle !== currentBeam.supply_per_cycle) {
      actions.push(
        setCycleSupply({
          session,
          badge_symbol: badgeSymbol,
          new_supply_per_cycle: newSupplyPerCycle,
        })
      )
    }

    if (actions.length > 0) {
      for (const action of actions) {
        await action
      }
      toast.success('Beam updated successfully')
      setTimeout(
        () => queryClient.refetchQueries({ queryKey: ['beams', name] }),
        1000
      )
    }
  }

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
                  onEditBeam={setEditingBeam}
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
      <EditBeamModal
        beam={editingBeam}
        badge={
          editingBeam
            ? badgesBySymbol.get(editingBeam.badge_symbol) ?? null
            : null
        }
        open={!!editingBeam}
        onOpenChange={(open) => {
          if (!open) setEditingBeam(null)
        }}
        onSave={handleSaveBeam}
      />
    </>
  )
}
