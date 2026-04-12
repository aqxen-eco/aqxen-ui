'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Popover from '@radix-ui/react-popover'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Command } from 'cmdk'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Children, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  MdClose,
  MdMoreHoriz,
  MdOutlineCampaign,
  MdStar,
  MdWorkspacePremium,
} from 'react-icons/md'
import { toast } from 'react-toastify'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { getRarityCounts } from '@/api/chain/badge/get-rarity-counts'
import { listBadge } from '@/api/chain/badge/list-badge'
import { sendMultiBadge } from '@/api/chain/badge/send-multi-badge'
import { listBadgeAutomation } from '@/api/chain/badge-automation/list-badge-automation'
import { getTrackingBadgeSymbols } from '@/api/chain/beams/get-tracking-badge-symbols'
import { giveBeamsBatch } from '@/api/chain/beams/give-beams-batch'
import {
  type BeamMetadata,
  listBeamMetadata,
} from '@/api/chain/beams/list-beam-metadata'
import {
  type BeamStats,
  listBeamStats,
} from '@/api/chain/beams/list-beam-stats'
import { listBeamTemplates } from '@/api/chain/beams/list-beam-templates'
import { postBeam } from '@/api/chain/beams/post-beam'
import { Avatar } from '@/components/ui/avatar'
import { BadgeDetailModal } from '@/components/ui/badge-detail-modal'
import { BadgeImage } from '@/components/ui/badge-image'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { useGetEffectiveSupply } from '@/hooks/query/use-get-effective-supply'
import { useGetOrganization } from '@/hooks/query/use-get-organization'
import { useDateLocale, useIntlLocale } from '@/hooks/use-date-locale'
import { useTranslateBadgeName } from '@/hooks/use-translate-badge-name'
import { formatNumber, getListFormat } from '@/utils/intl-format'

import { createPost } from './actions'
import { processBeamGive } from './reputation'

function getBeamBalance(
  meta: BeamMetadata | undefined,
  stat: BeamStats | undefined,
): number {
  if (!stat) return 0
  const rawBalance = parseInt(stat.badge_asset.split(' ')[0], 10) || 0
  if (!meta) return rawBalance

  const now = Date.now() / 1000
  const starttime = new Date(`${meta.starttime}Z`).getTime() / 1000
  const cycleLength = meta.cycle_length
  if (cycleLength <= 0 || now < starttime) return rawBalance

  const elapsed = now - starttime
  const currentCycleStart =
    starttime + Math.floor(elapsed / cycleLength) * cycleLength
  const lastClaimed =
    new Date(`${stat.last_claimed_time}Z`).getTime() / 1000

  // Balance from a previous cycle is unusable — treat as 0.
  if (lastClaimed < currentCycleStart) return 0
  return rawBalance
}

type BeamBreakdownRow = { name: string; score: number }

function buildBeamBreakdown(
  beamGives: BeamGiveEntry[] | undefined,
  badgeRows:
    | {
        badge_symbol: string
        onchain_lookup_data: {
          user: { display_name: string }
        }
      }[]
    | undefined,
): BeamBreakdownRow[] {
  if (!beamGives || beamGives.length === 0) return []

  const grouped = new Map<string, number>()
  for (const g of beamGives) {
    // Use deltaScore for new records, fall back to old fields
    const total =
      g.deltaScore > 0
        ? g.deltaScore
        : g.parAmount + g.upaEmitted + g.gpaEmitted + g.rpaEmitted
    grouped.set(
      g.badgeSymbol,
      (grouped.get(g.badgeSymbol) ?? 0) + total,
    )
  }

  return Array.from(grouped.entries()).map(([symbol, score]) => {
    const badge = badgeRows?.find((b) => b.badge_symbol === symbol)
    const name =
      badge?.onchain_lookup_data.user.display_name ?? symbol
    return { name, score: Math.round(score * 100) / 100 }
  })
}

type BeamGiveEntry = {
  badgeSymbol: string
  parAmount: number
  upaEmitted: number
  gpaEmitted: number
  rpaEmitted: number
  trackingDeltas: Record<string, number> | unknown
  deltaScore: number
}

type PostItemProps = {
  id: string
  actor: string
  avatarIpfs?: string | null
  createdAt: Date
  content: string
  badgeSymbol: string[]
  mentions?: string[]
  organization?: string | null
  totalScore: number
  beamGives?: BeamGiveEntry[]
  isAnnouncement?: boolean
  hideActions?: boolean
  children: React.ReactNode
}

const recognizeSchema = z.object({
  content: z.string().nonempty('Comment content is required'),
  badges: z.string().array().min(1, 'Select at least one badge'),
})

type RecognizeSchema = z.infer<typeof recognizeSchema>

const commentSchema = z.object({
  content: z.string().nonempty('Comment content is required'),
})

type CommentSchema = z.infer<typeof commentSchema>

export function PostItem({
  id,
  actor,
  avatarIpfs,
  createdAt,
  content,
  badgeSymbol,
  mentions,
  organization,
  totalScore,
  beamGives,
  isAnnouncement,
  hideActions,
  children,
}: PostItemProps) {
  const tp = useTranslations('postItem')
  const translateBadgeName = useTranslateBadgeName()
  const dateLocale = useDateLocale()
  const intlLocale = useIntlLocale()
  const [showRecognize, setShowRecognize] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [addBadgeOpen, setAddBadgeOpen] = useState(false)
  const { name } = useOrganization()

  const orgQuery = useGetOrganization(organization)
  const orgAvatar =
    orgQuery.data?.rows[0]?.offchain_lookup_data?.user.ipfs_image
  const orgDisplayName =
    orgQuery.data?.rows[0]?.onchain_lookup_data?.user.display_name
  const [showMore, setShowMore] = useState(() => {
    return Children.count(children) > 1
  })

  const badgeScope = organization || name

  const query = useQuery({
    queryKey: ['badges', badgeScope],
    queryFn: async () => await listBadge({ scope: badgeScope }),
    enabled: !!badgeScope,
  })

  const beamMetadataQuery = useQuery({
    queryKey: ['beam-metadata', badgeScope],
    queryFn: async () => await listBeamMetadata({ scope: badgeScope }),
    enabled: !!badgeScope,
  })

  const beamTemplatesQuery = useQuery({
    queryKey: ['beam-templates'],
    queryFn: listBeamTemplates,
  })

  const automationsQuery = useQuery({
    queryKey: ['badge-automations', badgeScope],
    queryFn: async () => await listBadgeAutomation({ scope: badgeScope }),
    enabled: !!badgeScope,
  })

  const badgeRows = query.data?.rows
  const beamMetadata = beamMetadataQuery.data
  const beamTemplates = beamTemplatesQuery.data
  const automations = automationsQuery.data?.rows

  const { beamBadges, customBadges } = useMemo(() => {
    if (!badgeRows) {
      return { beamBadges: [], customBadges: [] }
    }

    // Beam badges are identified by having beam metadata for the org.
    const beamSymbols = new Set(
      (beamMetadata ?? []).map((m) => m.badge_symbol.split(',')[1])
    )

    // Tracking badges (the auto-awarded counters that sit alongside
    // each default beam) are identified by display-name convention,
    // matching the canonical filter used in
    // src/app/profile/[user]/functions.ts. A badge is a tracking
    // badge when its display name is "{Beam} Giving" / " Rep" /
    // " Uniqueness" and {Beam} matches a beam template name. We also
    // exclude badges whose display name *is* a beam template name —
    // those are inactive beam shells the user can't recognize with.
    const trackingMetrics = ['Giving', 'Rep', 'Uniqueness']
    const templateNames = new Set(
      (beamTemplates ?? []).map((t) => t.display_name)
    )

    const isTrackingBadge = (badge: (typeof badgeRows)[number]) => {
      const displayName = badge.onchain_lookup_data?.user?.display_name
      if (!displayName) return false
      if (templateNames.has(displayName)) return true
      return trackingMetrics.some((metric) => {
        if (!displayName.endsWith(` ${metric}`)) return false
        const beamName = displayName.slice(0, -(metric.length + 1))
        return templateNames.has(beamName)
      })
    }

    const beams: typeof badgeRows = []
    const custom: typeof badgeRows = []

    for (const badge of badgeRows) {
      const symbolName = badge.badge_symbol.split(',')[1]
      if (symbolName && beamSymbols.has(symbolName)) {
        beams.push(badge)
      } else if (!isTrackingBadge(badge)) {
        custom.push(badge)
      }
    }

    return { beamBadges: beams, customBadges: custom }
  }, [badgeRows, beamMetadata, beamTemplates])

  const { actor: currentActor, session } = useChain()

  const beamStatsQuery = useQuery({
    queryKey: ['beam-stats', currentActor],
    queryFn: () => listBeamStats({ scope: currentActor! }),
    enabled: !!currentActor,
  })
  const beamStats = beamStatsQuery.data ?? []

  const effectiveSupplyQuery = useGetEffectiveSupply({
    orgScope: badgeScope,
    beams: beamMetadata ?? [],
  })
  const effectiveSupplyMap = effectiveSupplyQuery.data

  const isOwnPost = currentActor === actor
  const isOrgPost = !!organization && actor === organization
  const isOrgOwner = !!organization && currentActor === organization

  const recognizeForm = useForm<RecognizeSchema>({
    resolver: zodResolver(recognizeSchema),
  })

  const commentForm = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
  })

  const queryClient = useQueryClient()

  const recognizeContent = recognizeForm.watch('content')
  const badgesWatched = recognizeForm.watch('badges')
  const commentContent = commentForm.watch('content')

  async function onRecognize({ content, badges }: RecognizeSchema) {
    try {
      const beamBadgeSymbols = new Set(
        beamBadges.map((b) => b.badge_symbol),
      )
      const selectedBeamBadges = badges.filter((b) =>
        beamBadgeSymbols.has(b),
      )
      const selectedCustomBadges = badges.filter(
        (b) => !beamBadgeSymbols.has(b),
      )

      // Collect before-rarity-counts for all beam badges
      const beamDeltasMap = new Map<
        string,
        { trackingDeltas: Record<string, number>; deltaScore: number }
      >()

      if (selectedBeamBadges.length > 0) {
        // Gather all tracking symbols and snapshot before-counts
        const scope = organization ?? badgeScope
        const perBadgeTracking = selectedBeamBadges.map((badge) => {
          const badgeName = badge.split(',')[1] ?? badge
          const trackingSymbols = automations
            ? getTrackingBadgeSymbols(badgeName, automations)
            : []
          return { badge, trackingSymbols }
        })

        const allTrackingSymbols = [
          ...new Set(
            perBadgeTracking.flatMap((b) => b.trackingSymbols),
          ),
        ]

        const before = await getRarityCounts(scope, allTrackingSymbols)

        // Execute all givebeam actions in a single transaction
        await giveBeamsBatch({
          session: session!,
          beams: selectedBeamBadges.map((badge) => ({
            badge_symbol: badge,
            amount: 1,
          })),
          from: currentActor!,
          to: actor,
          post_content: content,
          parsed_content: content,
        })

        // Poll until the API reflects the on-chain state changes
        let after = before
        if (allTrackingSymbols.length > 0) {
          for (let attempt = 0; attempt < 5; attempt++) {
            await new Promise((r) => setTimeout(r, 1000))
            after = await getRarityCounts(scope, allTrackingSymbols)
            const changed = allTrackingSymbols.some(
              (s) => (after.get(s) ?? 0) !== (before.get(s) ?? 0),
            )
            if (changed) break
          }
        }

        // Compute per-badge deltas from the combined before/after
        for (const { badge, trackingSymbols } of perBadgeTracking) {
          const trackingDeltas: Record<string, number> = {}
          let deltaScore = 0
          for (const sym of trackingSymbols) {
            const delta =
              (after.get(sym) ?? 0) - (before.get(sym) ?? 0)
            if (delta > 0) {
              trackingDeltas[sym] = delta
              deltaScore += delta
            }
          }
          beamDeltasMap.set(badge, { trackingDeltas, deltaScore })
        }
      }

      // Send custom badges via givesimple
      let txResult
      if (selectedCustomBadges.length > 0) {
        const data = selectedCustomBadges.map((badge) => ({
          session: session!,
          badge_symbol: badge,
          amount: 1,
          to: actor,
          memo: content,
        }))
        txResult = await sendMultiBadge(data)
      }

      let onChainPostId: string | undefined
      const logAction = txResult?.response?.processed?.action_traces
        ?.flatMap(
          (t: {
            inline_traces?: {
              act?: {
                name?: string
                data?: { post_id?: number }
              }
            }[]
          }) => t.inline_traces ?? [],
        )
        ?.find(
          (t: { act?: { name?: string } }) =>
            t.act?.name === 'logpost',
        )
      if (logAction?.act?.data?.post_id != null) {
        onChainPostId = String(logAction.act.data.post_id)
      }

      const result = await createPost({
        parentId: id,
        content,
        badgeSymbol: badges,
        mention: [actor],
        onChainPostId,
      })

      if (result.success && result.postId && organization) {
        await Promise.all(
          selectedBeamBadges.map((badge) => {
            const deltas = beamDeltasMap.get(badge) ?? {
              trackingDeltas: {},
              deltaScore: 0,
            }
            return processBeamGive({
              postId: result.postId!,
              recipientActor: actor,
              badgeSymbol: badge,
              trackingDeltas: deltas.trackingDeltas,
              deltaScore: deltas.deltaScore,
              orgAccount: organization,
            })
          }),
        )
      }

      toast(tp('recognitionPublished'))
      recognizeForm.reset()
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setShowRecognize(false)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['beam-stats'] })
      }, 1000)
    } catch {
      toast.error(tp('recognitionFailed'))
    }
  }

  async function onComment({ content }: CommentSchema) {
    try {
      if (session && organization && currentActor) {
        await postBeam({
          session,
          org: organization,
          from: currentActor,
          post_content: content,
          parsed_content: content,
        })
      }

      await createPost({
        parentId: id,
        content,
      })

      toast(tp('commentPublished'))
      commentForm.reset()
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setShowRecognize(false)
    } catch {
      toast.error(tp('commentFailed'))
    }
  }

  return (
    <Box className="before:bg-gray-2 after:bg-gray-2 relative p-0 before:absolute before:top-4 before:left-10 before:h-[calc(100%-2rem)] before:w-0.5 before:content-[''] after:absolute after:bottom-4 after:left-9.25 after:size-2 after:rounded-full after:content-[''] md:p-4 md:before:top-8 md:before:left-14 md:before:h-[calc(100%-4rem)] md:after:bottom-8 md:after:left-13.25">
      <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
        <div className="relative">
          <Avatar
            size="md"
            className="ring-gray-1 relative z-10 ring-8"
            src={avatarIpfs ? IPFS_IMAGE_SOURCE + avatarIpfs : undefined}
          >
            {actor.slice(0, 2)}
          </Avatar>
          {organization && orgAvatar && (
            <div className="absolute -right-1 -top-1 z-20">
              <Avatar
                size="xs"
                src={IPFS_IMAGE_SOURCE + orgAvatar}
                className="ring-gray-1 ring-2"
              >
                {organization.slice(0, 2)}
              </Avatar>
            </div>
          )}
        </div>
        <div className="max-md:space-y-2">
          <div className="flex flex-wrap items-center justify-between max-md:space-y-2">
            <p className="text-body-2 flex flex-wrap items-center text-white">
              {isAnnouncement && (
                <span className="text-yellow-400 mr-1 inline-flex items-center gap-0.5">
                  <MdOutlineCampaign className="size-4" />
                  <span className="text-caption font-medium">
                    {tp('announcement')}
                  </span>
                </span>
              )}
              {!isAnnouncement && (
                <Link href={`/profile/${actor}`} className="hover:underline">
                  {actor}
                </Link>
              )}
              {mentions && mentions.length > 0 && (
                <>
                  {' '}
                  <span className="text-gray-3">{tp('recognize').toLowerCase()}</span>{' '}
                  {getListFormat(intlLocale).formatToParts(mentions).map(({ type, value }) =>
                    type === 'element' ? (
                      <Link
                        key={value}
                        href={`/profile/${value}`}
                        className="hover:underline"
                      >
                        {value}
                      </Link>
                    ) : (
                      <span key={value} className="text-gray-3">
                        {value}
                      </span>
                    )
                  )}
                </>
              )}
              <span className="text-gray-3 mx-1">•</span>
              <span className="text-gray-3">
                {format(new Date(createdAt), 'EEE d MMM', { locale: dateLocale })}
              </span>
              {organization && orgDisplayName && (
                <>
                  <span className="text-gray-3 mx-1">•</span>
                  <Link
                    href={`/organizations/${organization}`}
                    className="text-gray-3 hover:text-white hover:underline"
                  >
                    {orgDisplayName}
                  </Link>
                </>
              )}
            </p>
            {!isAnnouncement && (
              <Tooltip
                className="min-w-40"
                content={
                  (() => {
                    const rows = buildBeamBreakdown(beamGives, badgeRows)
                    if (rows.length === 0) {
                      return (
                        <span className="text-gray-3">
                          {tp('noBeamContributions')}
                        </span>
                      )
                    }
                    return (
                      <div className="space-y-1">
                        {rows.map((row) => (
                          <div
                            key={row.name}
                            className="flex justify-between gap-4"
                          >
                            <span className="text-white">{translateBadgeName(row.name)}</span>
                            <span className="text-gray-3 tabular-nums">
                              {formatNumber(row.score, intlLocale)}
                            </span>
                          </div>
                        ))}
                        <div className="border-gray-2 my-1 border-t" />
                        <div className="flex justify-between gap-4">
                          <span className="text-white font-medium">
                            {tp('total')}
                          </span>
                          <span className="text-white tabular-nums font-medium">
                            {formatNumber(totalScore, intlLocale)}
                          </span>
                        </div>
                      </div>
                    )
                  })()
                }
              >
                <div className="text-gray-3 flex cursor-default gap-0.5">
                  <MdWorkspacePremium className="size-6" />
                  <span className="text-body-2">{formatNumber(totalScore, intlLocale)}</span>
                </div>
              </Tooltip>
            )}
          </div>
          {badgeSymbol.length > 0 && (
            <div>
              {query.isSuccess &&
                query.data.rows.map(
                  (row) =>
                    badgeSymbol.includes(row.badge_symbol) && (
                      <Tooltip
                        key={row.badge_symbol}
                        content={translateBadgeName(row.onchain_lookup_data.user.display_name)}
                      >
                        <Button
                          square
                          onClick={() =>
                            setSelectedBadge(row.badge_symbol)
                          }
                        >
                          <BadgeImage
                            src={row.offchain_lookup_data.user.ipfs_image}
                            size="xs"
                            badgeSymbol={row.badge_symbol}
                            displayName={row.onchain_lookup_data.user.display_name}
                          />
                        </Button>
                      </Tooltip>
                    )
                )}
              <BadgeDetailModal
                open={!!selectedBadge}
                onOpenChange={(open) => {
                  if (!open) setSelectedBadge(null)
                }}
                badgeSymbol={selectedBadge ?? ''}
                scope={organization ?? name}
              />
            </div>
          )}
          <p className="text-body-2 text-gray-3">{content}</p>
          {currentActor && !hideActions && (
            <AnimatePresence>
              {!showRecognize && (
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="secondary"
                    className="mt-2 items-center"
                    onClick={() => setShowRecognize(true)}
                  >
                    {isOwnPost || isOrgPost || isOrgOwner ? (
                      tp('comment')
                    ) : (
                      <>
                        <MdStar className="size-4" />
                        {tp('recognize')}
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
              {showRecognize && (isOwnPost || isOrgPost || isOrgOwner) && (
                <motion.form
                  onSubmit={commentForm.handleSubmit(onComment)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2 }}
                  className="border-gray-2 mt-4 space-y-4 border-t pt-4"
                >
                  <div>
                    <span className="text-body-2 mb-1 block font-medium text-white">
                      {tp('comment')}
                    </span>
                    <label className="bg-gray-1 border-gray-2 block rounded-xl border p-4">
                      <textarea
                        {...commentForm.register('content')}
                        placeholder={tp('commentPlaceholder')}
                        className="text-body-2 placeholder:text-gray-3 block field-sizing-content w-full resize-none outline-none"
                        rows={1}
                      />
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      className="mr-2"
                      onClick={() => setShowRecognize(false)}
                    >
                      {tp('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        !commentContent || commentContent.length === 0
                      }
                    >
                      {tp('post')}
                    </Button>
                  </div>
                </motion.form>
              )}
              {showRecognize && !isOwnPost && !isOrgPost && !isOrgOwner && (
                <motion.form
                  onSubmit={recognizeForm.handleSubmit(onRecognize)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2 }}
                  className="border-gray-2 mt-4 space-y-4 border-t pt-4"
                >
                  {beamBadges.length > 0 && (
                    <div>
                      <span className="text-body-2 mb-1 block font-medium text-white">
                        {tp('beams')}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {beamBadges.map((badge) => {
                          const isSelected = badgesWatched?.includes(
                            badge.badge_symbol
                          )
                          return (
                            <button
                              key={badge.badge_symbol}
                              type="button"
                              onClick={() => {
                                const current =
                                  recognizeForm.getValues('badges') ?? []
                                if (current.includes(badge.badge_symbol)) {
                                  recognizeForm.setValue(
                                    'badges',
                                    current.filter(
                                      (s) => s !== badge.badge_symbol
                                    ),
                                    { shouldValidate: true }
                                  )
                                } else {
                                  recognizeForm.setValue(
                                    'badges',
                                    [...current, badge.badge_symbol],
                                    { shouldValidate: true }
                                  )
                                }
                              }}
                              className={twMerge(
                                'border-gray-2 bg-gray-1 inline-flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors',
                                isSelected && 'border-white bg-gray-2'
                              )}
                            >
                              <BadgeImage
                                src={
                                  badge.offchain_lookup_data.user.ipfs_image
                                }
                                size="xs"
                                badgeSymbol={badge.badge_symbol}
                                displayName={badge.onchain_lookup_data.user.display_name}
                              />
                              <span className="text-body-2 font-medium text-white">
                                {translateBadgeName(badge.onchain_lookup_data.user.display_name)}
                                {(() => {
                                  const symbolName =
                                    badge.badge_symbol.split(',')[1]
                                  const stat = beamStats.find(
                                    (s) =>
                                      s.badge_asset.split(' ')[1] ===
                                      symbolName,
                                  )
                                  const meta = (beamMetadata ?? []).find(
                                    (m) =>
                                      m.badge_symbol === badge.badge_symbol,
                                  )
                                  const balance = getBeamBalance(meta, stat)
                                  const supply =
                                    effectiveSupplyMap?.get(symbolName) ?? 0
                                  return (
                                    <span className="text-gray-3 ml-1">
                                      {balance} / {supply}
                                    </span>
                                  )
                                })()}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {customBadges.length > 0 && (
                    <div>
                      <span className="text-body-2 mb-1 block font-medium text-white">
                        {beamBadges.length > 0 ? tp('otherBadges') : tp('badges')}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {customBadges
                          .filter((b) =>
                            badgesWatched?.includes(b.badge_symbol)
                          )
                          .map((badge) => (
                            <div
                              key={badge.badge_symbol}
                              className="border-white bg-gray-2 inline-flex items-center gap-2 rounded-xl border px-3 py-2"
                            >
                              <BadgeImage
                                src={
                                  badge.offchain_lookup_data.user.ipfs_image
                                }
                                size="xs"
                                badgeSymbol={badge.badge_symbol}
                                displayName={badge.onchain_lookup_data.user.display_name}
                              />
                              <span className="text-body-2 font-medium text-white">
                                {translateBadgeName(badge.onchain_lookup_data.user.display_name)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current =
                                    recognizeForm.getValues('badges') ?? []
                                  recognizeForm.setValue(
                                    'badges',
                                    current.filter(
                                      (s) => s !== badge.badge_symbol
                                    ),
                                    { shouldValidate: true }
                                  )
                                }}
                                className="text-gray-3 hover:text-white -mr-1"
                              >
                                <MdClose className="size-4" />
                              </button>
                            </div>
                          ))}
                        <Popover.Root
                          open={addBadgeOpen}
                          onOpenChange={setAddBadgeOpen}
                        >
                          <Popover.Trigger asChild>
                            <button
                              type="button"
                              className="border-gray-2 bg-gray-1 inline-flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors hover:border-white"
                            >
                              <span className="text-body-2 font-medium text-white">
                                {tp('addBadge')}
                              </span>
                            </button>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content
                              side="bottom"
                              align="start"
                              sideOffset={8}
                              className="border-gray-2 bg-gray-1 z-70 w-64 rounded-2xl border p-2"
                            >
                              <Command
                                filter={(value, search) => {
                                  const badge = customBadges.find(
                                    (b) => b.badge_symbol === value
                                  )
                                  if (
                                    badge?.onchain_lookup_data.user.display_name
                                      .toLowerCase()
                                      .includes(search.toLowerCase())
                                  )
                                    return 1
                                  return 0
                                }}
                              >
                                <Command.Input
                                  placeholder={tp('searchBadges')}
                                  className="text-body-2 placeholder:text-gray-3 w-full bg-transparent px-2 py-1.5 text-white outline-none"
                                />
                                <Command.List className="mt-1 max-h-48 overflow-y-auto [&_[cmdk-list-sizer]]:space-y-1">
                                  <Command.Empty className="text-body-2 text-gray-3 py-4 text-center">
                                    {tp('noBadgesFound')}
                                  </Command.Empty>
                                  {customBadges
                                    .filter(
                                      (b) =>
                                        !badgesWatched?.includes(
                                          b.badge_symbol
                                        )
                                    )
                                    .map((badge) => (
                                      <Command.Item
                                        key={badge.badge_symbol}
                                        value={badge.badge_symbol}
                                        onSelect={() => {
                                          const current =
                                            recognizeForm.getValues(
                                              'badges'
                                            ) ?? []
                                          recognizeForm.setValue(
                                            'badges',
                                            [
                                              ...current,
                                              badge.badge_symbol,
                                            ],
                                            { shouldValidate: true }
                                          )
                                          setAddBadgeOpen(false)
                                        }}
                                        className="text-body-2 text-gray-3 data-[selected=true]:bg-gray-2 flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 outline-hidden select-none data-[selected=true]:text-white"
                                      >
                                        <BadgeImage
                                          src={
                                            badge.offchain_lookup_data.user
                                              .ipfs_image
                                          }
                                          size="xs"
                                          badgeSymbol={badge.badge_symbol}
                                          displayName={badge.onchain_lookup_data.user.display_name}
                                        />
                                        <span className="text-body-2 font-medium">
                                          {translateBadgeName(
                                            badge.onchain_lookup_data.user
                                              .display_name,
                                          )}
                                        </span>
                                      </Command.Item>
                                    ))}
                                </Command.List>
                              </Command>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-body-2 mb-1 block font-medium text-white">
                      {tp('message')}
                    </span>
                    <label className="bg-gray-1 border-gray-2 block rounded-xl border p-4">
                      <textarea
                        {...recognizeForm.register('content')}
                        placeholder={tp('messagePlaceholder')}
                        className="text-body-2 placeholder:text-gray-3 block field-sizing-content w-full resize-none outline-none"
                        rows={1}
                      />
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      className="mr-2"
                      onClick={() => setShowRecognize(false)}
                    >
                      {tp('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        !recognizeContent ||
                        recognizeContent.length === 0 ||
                        !badgesWatched ||
                        badgesWatched.length === 0
                      }
                    >
                      {tp('post')}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
      <div
        data-comments={showMore ? 'one' : 'all'}
        className="[&[data-comments=all]>*]:grid [&[data-comments=one]>:not(:first-child)]:hidden"
      >
        {children}
      </div>
      {showMore && (
        <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
          <div className="border-gray-2 bg-gray-1 ring-gray-1 relative z-10 flex size-12 items-center justify-center rounded-full border ring-8">
            <MdMoreHoriz className="size-6 text-white" />
          </div>
          <div className="flex items-center justify-start">
            <Button variant="secondary" onClick={() => setShowMore(false)}>
              {tp('showMore')}
            </Button>
          </div>
        </div>
      )}
    </Box>
  )
}

type PostItemCommentProps = {
  actor: string
  avatarIpfs?: string | null
  createdAt: Date
  content: string
  badgeSymbol?: string[]
  organization?: string | null
  totalScore?: number
  beamGives?: BeamGiveEntry[]
  hideScore?: boolean
}

export function PostItemComment({
  actor,
  avatarIpfs,
  createdAt,
  content,
  badgeSymbol = [],
  organization,
  totalScore,
  beamGives,
  hideScore,
}: PostItemCommentProps) {
  const tp = useTranslations('postItem')
  const translateBadgeName = useTranslateBadgeName()
  const dateLocale = useDateLocale()
  const intlLocale = useIntlLocale()
  const { name } = useOrganization()
  const badgeScope = organization || name

  const orgQuery = useGetOrganization(organization)
  const orgAvatar =
    orgQuery.data?.rows[0]?.offchain_lookup_data?.user.ipfs_image

  const badgesQuery = useQuery({
    queryKey: ['badges', badgeScope],
    queryFn: async () => await listBadge({ scope: badgeScope }),
    enabled: !!badgeScope && badgeSymbol.length > 0,
  })

  return (
    <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
      <div className="relative">
        <Avatar
          size="md"
          className="ring-gray-1 relative z-10 ring-8"
          src={avatarIpfs ? IPFS_IMAGE_SOURCE + avatarIpfs : undefined}
        >
          {actor.slice(0, 2)}
        </Avatar>
        {organization && orgAvatar && (
          <div className="absolute -right-1 -top-1 z-20">
            <Avatar
              size="xs"
              src={IPFS_IMAGE_SOURCE + orgAvatar}
              className="ring-gray-1 ring-2"
            >
              {organization.slice(0, 2)}
            </Avatar>
          </div>
        )}
      </div>
      <div className="max-md:space-y-2">
        <div className="flex flex-wrap items-center justify-between max-md:space-y-2">
          <div className="flex gap-2">
            <p className="text-body-2 max-w-full text-white">
              <Link href={`/profile/${actor}`} className="hover:underline">
                {actor}
              </Link>
            </p>
            <span className="text-gray-3">
              {' '}
              • {format(new Date(createdAt), 'EEE d MMM', { locale: dateLocale })}
            </span>
          </div>
          {!hideScore && (
            <Tooltip
              className="min-w-40"
              content={
                (() => {
                  const rows = buildBeamBreakdown(
                    beamGives,
                    badgesQuery.data?.rows
                  )
                  if (rows.length === 0) {
                    return (
                      <span className="text-gray-3">
                        {tp('noBeamContributions')}
                      </span>
                    )
                  }
                  return (
                    <div className="space-y-1">
                      {rows.map((row) => (
                        <div
                          key={row.name}
                          className="flex justify-between gap-4"
                        >
                          <span className="text-white">{translateBadgeName(row.name)}</span>
                          <span className="text-gray-3 tabular-nums">
                            {formatNumber(row.score, intlLocale)}
                          </span>
                        </div>
                      ))}
                      <div className="border-gray-2 my-1 border-t" />
                      <div className="flex justify-between gap-4">
                        <span className="text-white font-medium">
                          {tp('total')}
                        </span>
                        <span className="text-white tabular-nums font-medium">
                          {formatNumber(totalScore ?? 0, intlLocale)}
                        </span>
                      </div>
                    </div>
                  )
                })()
              }
            >
              <div className="text-gray-3 flex cursor-default gap-0.5">
                <MdWorkspacePremium className="size-6" />
                <span className="text-body-2">{formatNumber(totalScore ?? 0, intlLocale)}</span>
              </div>
            </Tooltip>
          )}
        </div>
        {badgeSymbol.length > 0 && badgesQuery.isSuccess && (
          <div className="flex flex-wrap gap-1">
            {badgesQuery.data.rows
              .filter((row) => badgeSymbol.includes(row.badge_symbol))
              .map((row) => (
                <Tooltip
                  key={row.badge_symbol}
                  content={translateBadgeName(row.onchain_lookup_data.user.display_name)}
                >
                  <Button square>
                    <BadgeImage
                      src={row.offchain_lookup_data.user.ipfs_image}
                      size="xs"
                      badgeSymbol={row.badge_symbol}
                      displayName={row.onchain_lookup_data.user.display_name}
                    />
                  </Button>
                </Tooltip>
              ))}
          </div>
        )}
        <p className="text-body-2 text-gray-3">{content}</p>
      </div>
    </div>
  )
}
