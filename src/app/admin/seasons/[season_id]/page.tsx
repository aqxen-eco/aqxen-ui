'use client'

import { useQueries } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { MdOutlineAdd, MdOutlineInfo } from 'react-icons/md'

import { listBadge } from '@/api/chain/badge/list-badge'
import { listBadgeStatus } from '@/api/chain/badge/list-badge-status'
import { listSeason } from '@/api/chain/season/list-season'
import { endSeries } from '@/api/chain/series/end-series'
import { listSeries } from '@/api/chain/series/list-series'
import { startSeries } from '@/api/chain/series/start-series'
import type { Badge } from '@/api/model/badge'
import { BadgeStatus } from '@/api/model/badge'
import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { BadgeImage } from '@/components/ui/badge-image'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tag } from '@/components/ui/tag'
import { Tooltip } from '@/components/ui/tooltip'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

export default function SeasonPage() {
  const { name, removeOrganizationSymbol } = useOrganization()
  const { season_id } = useParams()
  const { session } = useChain()
  const seasonIdDecoded = decodeURIComponent(season_id as string)
  const seasonId = seasonIdDecoded.split(',')[1]

  const [seasonQuery, badgesQuery, badgesStatusQuery, seriesQuery] = useQueries(
    {
      queries: [
        {
          queryKey: ['seasons', seasonId, name],
          queryFn: async () =>
            await listSeason({
              scope: name,
              lower_bound: seasonId,
              upper_bound: seasonId,
            }),
        },
        {
          queryKey: ['badges', name],
          queryFn: async () =>
            await listBadge({
              scope: name,
            }),
        },
        {
          queryKey: ['badges-status', name],
          queryFn: async () =>
            await listBadgeStatus({
              scope: name,
            }),
        },
        {
          queryKey: ['series', seasonId],
          queryFn: async () =>
            await listSeries({
              scope: seasonId,
            }),
        },
      ],
    }
  )

  if (
    seasonQuery.isPending ||
    badgesQuery.isPending ||
    badgesStatusQuery.isPending ||
    seriesQuery.isPending
  ) {
    return null
  }

  const season = seasonQuery?.data?.rows?.[0]
  const seasonBadges = badgesQuery?.data?.rows.filter((badge) =>
    season?.init_badge_symbols.includes(badge.badge_symbol)
  )

  const series = seriesQuery?.data?.rows.map((series) => {
    const seriesBadge = badgesStatusQuery.data?.rows.reduce<Badge[]>(
      (acc, crr: BadgeStatus) => {
        const additionalBadgeInSeriesExists =
          crr.agg_symbol === seasonIdDecoded &&
          crr.seq_id === series.seq_id &&
          !seasonQuery?.data?.rows?.[0]?.init_badge_symbols.includes(
            crr.badge_symbol
          )

        if (additionalBadgeInSeriesExists) {
          const badge = badgesQuery.data?.rows.find(
            (item) => item.badge_symbol === crr.badge_symbol
          )

          if (badge) {
            return [...acc, badge]
          }

          return acc
        }
        return acc
      },
      []
    )

    return {
      ...series,
      badges: seriesBadge ?? [],
    }
  })

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/seasons">Seasons</HeaderAdminBack>
        <HeaderAdminTitle
          title={season?.onchain_lookup_data.user.display_name}
        />
      </HeaderAdmin>
      <div className="by-8 max-w-container-lg mx-auto space-y-8 px-4 pb-8">
        <section className="space-y-4">
          <header className="flex items-center">
            <div className="flex flex-1 items-center gap-1">
              <h2 className="text-title-2 text-white">Badges</h2>
              <Tooltip content="Lorem ipsum dolor sit amed">
                <Button variant="link" size="md" square>
                  <MdOutlineInfo className="size-6" />
                </Button>
              </Tooltip>
            </div>
            <div className="flex-none">
              <Link
                href={`/admin/seasons/${season_id}/add-badges`}
                variant="secondary"
                size="md"
              >
                Add badges
              </Link>
            </div>
          </header>
          {badgesQuery.isSuccess && (
            <>
              {seasonBadges && seasonBadges.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Sym</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-32 text-center">
                        Rarity counts
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seasonBadges?.map((badge) => (
                      <TableRow key={badge.badge_symbol}>
                        <TableCell className="text-gray-3">
                          {removeOrganizationSymbol(badge.badge_symbol)}
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-2">
                            <BadgeImage
                              src={badge.offchain_lookup_data.user.ipfs_image}
                              size="xs"
                            />
                            <span className="text-body-2 font-sans font-medium text-nowrap text-white">
                              {badge.onchain_lookup_data.user.display_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {badge.rarity_counts}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box className="flex h-50 w-full items-center justify-center text-center">
                  <p className="text-body-2 text-gray-3">
                    No badges in this season
                  </p>
                </Box>
              )}
            </>
          )}
        </section>
        <section className="space-y-4">
          <header className="flex items-center">
            <div className="flex flex-1 items-center gap-1">
              <h2 className="text-title-2 text-white">Series</h2>
              <Tooltip content="Lorem ipsum dolor sit amed">
                <Button variant="link" size="md" square>
                  <MdOutlineInfo className="size-6" />
                </Button>
              </Tooltip>
            </div>
            <div className="flex-none">
              <Link
                href={`/admin/seasons/${season_id}/add-series${series?.at(-1) ? `?last-series-id=${series?.at(-1)?.seq_id}` : ''}`}
                variant="secondary"
                size="md"
              >
                Add series
              </Link>
            </div>
          </header>
          {seriesQuery.isSuccess && (
            <>
              {series && series.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 text-center">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Additional Badges</TableHead>
                      <TableHead className="w-40">Status</TableHead>
                      <TableHead className="w-40" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {series &&
                      series.map((seriesItem) => (
                        <TableRow key={seriesItem.seq_id}>
                          <TableCell className="text-gray-3 text-center">
                            {seriesItem.seq_id}
                          </TableCell>
                          <TableCell>
                            {seriesItem.sequence_description}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              {seriesItem.badges.length > 0 &&
                                seriesItem.badges.map((badge) => (
                                  <Tooltip
                                    key={badge.badge_symbol}
                                    content={
                                      badge.onchain_lookup_data.user
                                        .display_name
                                    }
                                  >
                                    <div>
                                      <BadgeImage
                                        src={
                                          badge.offchain_lookup_data.user
                                            .ipfs_image
                                        }
                                        size="xs"
                                      />
                                    </div>
                                  </Tooltip>
                                ))}
                              {seriesItem.seq_status !== 'end' && (
                                <Tooltip content="Add badge">
                                  <Link
                                    href={`/admin/seasons/${season_id}/add-badges?series=${seriesItem.seq_id}`}
                                    variant="secondary"
                                    size="md"
                                    square
                                  >
                                    <MdOutlineAdd className="size-6" />
                                  </Link>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {seriesItem.seq_status === 'init' ? (
                              <Tag variant="blue">Created</Tag>
                            ) : seriesItem.seq_status === 'end' ? (
                              <Tag variant="red">Ended</Tag>
                            ) : seriesItem.seq_status === 'active' ? (
                              <Tag variant="green">Started</Tag>
                            ) : (
                              <></>
                            )}
                          </TableCell>
                          <TableCell className="flex justify-end gap-2">
                            {seriesItem.seq_status === 'init' ? (
                              <>
                                <Button
                                  variant="secondary"
                                  size="md"
                                  onClick={async () => {
                                    await startSeries({
                                      session: session!,
                                      agg_symbol: seasonIdDecoded,
                                      seq_ids: [seriesItem.seq_id],
                                    })
                                    seriesQuery.refetch()
                                  }}
                                >
                                  Start
                                </Button>
                              </>
                            ) : seriesItem.seq_status === 'end' ? (
                              <></>
                            ) : seriesItem.seq_status === 'active' ? (
                              <>
                                <Button
                                  variant="secondary"
                                  size="md"
                                  onClick={() => {
                                    endSeries({
                                      session: session!,
                                      agg_symbol: seasonIdDecoded,
                                      seq_ids: [seriesItem.seq_id],
                                    })
                                    seriesQuery.refetch()
                                  }}
                                >
                                  End
                                </Button>
                              </>
                            ) : (
                              <Button variant="secondary" size="md">
                                Start
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <Box className="flex h-50 w-full items-center justify-center text-center">
                  <p className="text-body-2 text-gray-3">
                    No series in this season
                  </p>
                </Box>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
