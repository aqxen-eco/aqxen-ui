'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { MdClose } from 'react-icons/md'

import { listBadge } from '@/api/chain/badge/list-badge'
import { listBadgeStatus } from '@/api/chain/badge/list-badge-status'
import { jungleClient } from '@/api/chain/jungle-client'
import { listSeason } from '@/api/chain/season/list-season'
import { listSeries } from '@/api/chain/series/list-series'
import { listBadgeCounts } from '@/api/chain/statistics/list-badge-counts'
import { listBadgeRanks } from '@/api/chain/statistics/list-badge-ranks'
import type { BoundedBadgeCounts } from '@/api/chain/statistics/list-bounded-badge-counts'
import { listBoundedBadgeRanks } from '@/api/chain/statistics/list-bounded-badge-ranks'
import type { Badge } from '@/api/model/badge'
import { getPostsByBadge } from '@/app/feed/actions'
import { Contract, IPFS_IMAGE_SOURCE } from '@/constants'

import { Avatar } from './avatar'
import { BadgeImage } from './badge-image'
import { Button } from './button'
import { DropdownItem, DropdownRoot } from './dropdown'

type SeasonOption = {
  label: string
  badgeAggSeqId: number
  totalIssued: number
  totalRecipients: number
}

type BadgeDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  badgeSymbol: string
  scope?: string
  badge?: Badge
}

export function BadgeDetailModal({
  open,
  onOpenChange,
  badgeSymbol,
  scope,
  badge: badgeProp,
}: BadgeDetailModalProps) {
  const [selected, setSelected] = useState<'all-time' | number>('all-time')
  const contentRef = useRef<HTMLDivElement>(null)

  const badgeQuery = useQuery({
    queryKey: ['badge-detail', scope, badgeSymbol],
    queryFn: async () => {
      const result = await listBadge({ scope })
      return result.rows.find((row) => row.badge_symbol === badgeSymbol)
    },
    enabled: open && !!scope && !badgeProp,
  })

  const seasonOptionsQuery = useQuery({
    queryKey: ['badge-season-options', scope, badgeSymbol],
    queryFn: async () => {
      const statusResult = await listBadgeStatus({ scope })
      const badgeStatuses = statusResult.rows.filter(
        (row) => row.badge_symbol === badgeSymbol
      )
      if (badgeStatuses.length === 0) return []

      const aggSymbols = [
        ...new Set(badgeStatuses.map((s) => s.agg_symbol)),
      ]
      const [seasonsResult, ...seriesResults] = await Promise.all([
        listSeason({ scope }),
        ...aggSymbols.map((sym) =>
          listSeries({ scope: sym.split(',')[1] })
        ),
      ])

      const countsResult = await jungleClient.v1.chain.get_table_rows({
        code: Contract.BOUNDED_STATS,
        scope: scope!,
        table: 'counts',
        json: true,
        limit: 1000,
      })
      const allCounts = countsResult.rows as BoundedBadgeCounts[]

      const options: SeasonOption[] = []
      for (let i = 0; i < badgeStatuses.length; i++) {
        const status = badgeStatuses[i]
        const counts = allCounts.find(
          (c) => c.badge_agg_seq_id === status.badge_agg_seq_id
        )
        const season = seasonsResult.rows.find(
          (s) => s.agg_symbol === status.agg_symbol
        )
        const symIndex = aggSymbols.indexOf(status.agg_symbol)
        const seriesData =
          symIndex >= 0 ? seriesResults[symIndex] : undefined
        const series = seriesData?.rows.find(
          (s) => s.seq_id === status.seq_id
        )
        const seasonName =
          season?.onchain_lookup_data?.user?.display_name ||
          status.agg_symbol.split(',')[1]
        const seriesName =
          series?.sequence_description || `#${status.seq_id}`
        options.push({
          label: `${seasonName} — ${seriesName}`,
          badgeAggSeqId: status.badge_agg_seq_id,
          totalIssued: counts?.total_issued ?? 0,
          totalRecipients: counts?.total_recipients ?? 0,
        })
      }
      return options
    },
    enabled: open && !!scope,
  })

  const seasonOptions = seasonOptionsQuery.data ?? []

  const selectedBadgeAggSeqId =
    typeof selected === 'number' ? selected : undefined

  const selectedLabel =
    selected === 'all-time'
      ? 'All Time'
      : seasonOptions.find((o) => o.badgeAggSeqId === selected)?.label ??
        'All Time'

  // All-time stats (always fetched so they serve as fallback)
  const allTimeStatsQuery = useQuery({
    queryKey: ['badge-stats', scope, badgeSymbol],
    queryFn: async () => {
      const result = await listBadgeCounts({ scope: scope! })
      return result.rows.find((row) => row.badge_symbol === badgeSymbol)
    },
    enabled: open && !!scope,
  })

  const allTimeRanksQuery = useQuery({
    queryKey: ['badge-ranks', badgeSymbol],
    queryFn: () => listBadgeRanks({ badgeSymbol, limit: 10 }),
    enabled: open && !!badgeSymbol,
  })

  // Seasonal ranks
  const seasonalRanksQuery = useQuery({
    queryKey: ['badge-ranks-seasonal', selectedBadgeAggSeqId],
    queryFn: () =>
      listBoundedBadgeRanks({
        badgeAggSeqId: selectedBadgeAggSeqId!,
        limit: 10,
      }),
    enabled: open && selectedBadgeAggSeqId !== undefined,
  })

  const selectedSeasonOption =
    typeof selected === 'number'
      ? seasonOptions.find((o) => o.badgeAggSeqId === selected)
      : undefined
  const stats =
    selected === 'all-time'
      ? allTimeStatsQuery.data
      : selectedSeasonOption
        ? {
            total_issued: selectedSeasonOption.totalIssued,
            total_recipients: selectedSeasonOption.totalRecipients,
          }
        : undefined
  const ranks = (
    selected === 'all-time'
      ? allTimeRanksQuery.data?.rows
      : seasonalRanksQuery.data?.rows
  )
    ?.slice()
    .sort((a, b) => b.balance - a.balance)

  const awardsQuery = useQuery({
    queryKey: ['badge-awards', badgeSymbol],
    queryFn: () => getPostsByBadge({ badgeSymbol, limit: 3 }),
    enabled: open && !!badgeSymbol,
  })

  const badge = badgeProp ?? badgeQuery.data
  const isLoading = !badgeProp && badgeQuery.isLoading
  const hasSeasons = seasonOptions.length > 0

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
                ref={contentRef}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 32 }}
                className="border-gray-2 bg-gray-1 fixed top-1/2 left-1/2 z-60 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-lg max-md:h-svh max-md:max-w-none max-md:rounded-none"
              >
                <Dialog.Close asChild>
                  <Button
                    size="md"
                    variant="link"
                    square
                    className="absolute top-4 right-4 z-10"
                  >
                    <MdClose className="size-6" />
                  </Button>
                </Dialog.Close>

                <div className="max-h-[80vh] overflow-y-auto p-6 max-md:max-h-svh [scrollbar-width:none] md:p-8">
                  {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-body-2 text-gray-3">Loading...</p>
                    </div>
                  ) : badge ? (
                    <>
                      <div className="flex flex-col items-center text-center">
                        <BadgeImage
                          src={badge.offchain_lookup_data.user.ipfs_image}
                          size="lg"
                        />
                        <Dialog.Title className="text-title-2 mt-4 text-white">
                          {badge.onchain_lookup_data.user.display_name}
                        </Dialog.Title>
                        <p className="text-body-3 text-gray-3 mt-1 font-mono">
                          {badgeSymbol.replace(/^\d+,/, '')}
                        </p>
                        <Dialog.Description className="text-body-2 text-gray-3 mt-1">
                          {badge.onchain_lookup_data.user.description}
                        </Dialog.Description>
                      </div>

                      {scope && (
                        <>
                          <div className="mt-6 flex justify-center">
                            {hasSeasons ? (
                              <DropdownRoot
                                label={selectedLabel}
                                align="center"
                                container={contentRef.current}
                              >
                                <DropdownItem
                                  isSelected={selected === 'all-time'}
                                  onClick={() => setSelected('all-time')}
                                >
                                  All Time
                                </DropdownItem>
                                {seasonOptions.map((option) => (
                                  <DropdownItem
                                    key={option.badgeAggSeqId}
                                    isSelected={
                                      selected === option.badgeAggSeqId
                                    }
                                    onClick={() =>
                                      setSelected(option.badgeAggSeqId)
                                    }
                                  >
                                    {option.label}
                                  </DropdownItem>
                                ))}
                              </DropdownRoot>
                            ) : (
                              <span className="text-body-2 font-medium text-white">
                                All Time
                              </span>
                            )}
                          </div>

                          <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="border-gray-2 rounded-xl border p-4 text-center">
                              <p className="text-title-2 text-white">
                                {stats?.total_issued ?? '—'}
                              </p>
                              <p className="text-body-3 text-gray-3">
                                Total Issued
                              </p>
                            </div>
                            <div className="border-gray-2 rounded-xl border p-4 text-center">
                              <p className="text-title-2 text-white">
                                {stats?.total_recipients ?? '—'}
                              </p>
                              <p className="text-body-3 text-gray-3">
                                Total Recipients
                              </p>
                            </div>
                          </div>

                          {ranks && ranks.length > 0 && (
                            <>
                              <div className="bg-gray-2 my-6 h-px" />
                              <h3 className="text-body-1 mb-4 font-medium text-white">
                                Leaderboard
                              </h3>
                              <div className="space-y-2">
                                {ranks.map((rank, index) =>
                                  rank.accounts.map((account) => (
                                    <Link
                                      key={`${index}-${account}`}
                                      href={`/profile/${account}`}
                                      className="border-gray-2 hover:bg-gray-2 flex items-center gap-3 rounded-xl border p-3 transition-colors"
                                    >
                                      <span className="text-body-2 text-gray-3 w-5 text-center font-medium">
                                        {index + 1}
                                      </span>
                                      <Avatar size="sm">
                                        {account.slice(0, 2)}
                                      </Avatar>
                                      <span className="text-body-2 min-w-0 flex-1 text-white">
                                        {account}
                                      </span>
                                      <span className="text-body-2 text-gray-3 font-medium">
                                        {rank.balance}
                                      </span>
                                    </Link>
                                  ))
                                )}
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {awardsQuery.data && awardsQuery.data.length > 0 && (
                        <>
                          <div className="bg-gray-2 my-6 h-px" />

                          <h3 className="text-body-1 mb-4 font-medium text-white">
                            Recent Recognitions
                          </h3>

                          <div className="space-y-4">
                            {awardsQuery.data.map((post) => (
                              <div
                                key={post.id}
                                className="border-gray-2 rounded-xl border p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    size="sm"
                                    src={
                                      post.user.avatarIpfs
                                        ? IPFS_IMAGE_SOURCE +
                                          post.user.avatarIpfs
                                        : undefined
                                    }
                                  >
                                    {post.user.actor.slice(0, 2)}
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-body-2 text-white">
                                      <Link
                                        href={`/profile/${post.user.actor}`}
                                        className="hover:underline"
                                      >
                                        {post.user.actor}
                                      </Link>
                                      {post.mention.length > 0 && (
                                        <>
                                          <span className="text-gray-3">
                                            {' '}
                                            →{' '}
                                          </span>
                                          {post.mention.map((m, i) => (
                                            <span key={m.id}>
                                              {i > 0 && (
                                                <span className="text-gray-3">
                                                  ,{' '}
                                                </span>
                                              )}
                                              <Link
                                                href={`/profile/${m.user.actor}`}
                                                className="hover:underline"
                                              >
                                                {m.user.actor}
                                              </Link>
                                            </span>
                                          ))}
                                        </>
                                      )}
                                    </p>
                                    <p className="text-body-3 text-gray-3">
                                      {format(
                                        new Date(post.createdAt),
                                        'EEE d MMM yyyy'
                                      )}
                                    </p>
                                  </div>
                                </div>
                                {post.content && (
                                  <p className="text-body-2 text-gray-3 mt-2">
                                    {post.content}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-body-2 text-gray-3">
                        Badge not found.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
