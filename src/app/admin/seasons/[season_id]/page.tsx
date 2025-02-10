'use client'

import { useQueries } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { MdOutlineAdd, MdOutlineInfo } from 'react-icons/md'

import { Badge, listBadge } from '@/api/chain/badge'
import { listBadgeStatus } from '@/api/chain/badge/list-badge-status'
import { listSeason } from '@/api/chain/season'
import { listSeries } from '@/api/chain/series'
import { endSeries } from '@/api/chain/series/end-series'
import { startSeries } from '@/api/chain/series/start-series'
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
  const { name, symbol } = useOrganization()
  const { season_id } = useParams()
  const { session } = useChain()
  const seasonId = decodeURIComponent(season_id as string).split(',')[1]

  const [seasonQuery, badgesQuery, badgesStatusQuery, seriesQuery] = useQueries(
    {
      queries: [
        {
          queryKey: ['seasons', seasonId, name, symbol],
          queryFn: async () =>
            await listSeason({
              scope: name,
              lower_bound: seasonId,
              upper_bound: seasonId,
              organization_symbol: symbol,
            }),
        },
        {
          queryKey: ['badges', name, symbol],
          queryFn: async () =>
            await listBadge({
              scope: name,
              organization_symbol: symbol,
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

  const series = seriesQuery?.data?.rows.map((series) => {
    const seriesBadge = badgesStatusQuery.data?.rows.reduce<Badge[]>(
      (acc, crr: BadgeStatus) => {
        if (
          crr.seq_id === series.id &&
          crr.agg_symbol === decodeURIComponent(season_id as string) &&
          !seasonQuery?.data?.rows?.[0]?.badges.includes(crr.badge_symbol)
        ) {
          const badge = badgesQuery.data?.rows.find(
            (item) => item.id === crr.badge_symbol
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
      badges: seriesBadge,
    }
  })

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/seasons">Seasons</HeaderAdminBack>
        <HeaderAdminTitle title={seasonQuery?.data?.rows?.[0]?.name ?? ''} />
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
              {badgesQuery.data && badgesQuery.data.rows.length > 0 ? (
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
                    {badgesQuery.data.rows.map(
                      (badge) =>
                        seasonQuery?.data?.rows?.[0]?.badges.includes(
                          badge.id
                        ) && (
                          <TableRow key={badge.symbol}>
                            <TableCell className="text-gray-3">
                              {badge.symbol}
                            </TableCell>
                            <TableCell>
                              <div className="inline-flex items-center gap-2">
                                <BadgeImage src={badge.ipfs} size="xs" />
                                <span className="text-body-2 font-sans font-medium text-nowrap text-white">
                                  {badge.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {badge.rarity_counts}
                            </TableCell>
                          </TableRow>
                        )
                    )}
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
                href={`/admin/seasons/${season_id}/add-series${series?.at(-1) ? `?last-series-id=${series?.at(-1)?.id}` : ''}`}
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
                      <TableHead>Badges</TableHead>
                      <TableHead className="w-40">Status</TableHead>
                      <TableHead className="w-40" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {series &&
                      series.map((seriesItem) => (
                        <TableRow key={seriesItem.id}>
                          <TableCell className="text-gray-3 text-center">
                            {seriesItem.id}
                          </TableCell>
                          <TableCell>{seriesItem.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              {seriesItem.badges &&
                                seriesItem.badges.length > 0 &&
                                seriesItem.badges.map((badge) => (
                                  <Tooltip key={badge.id} content={badge.name}>
                                    <div>
                                      <BadgeImage src={badge.ipfs} size="xs" />
                                    </div>
                                  </Tooltip>
                                ))}
                              {seriesItem.status !== 'end' && (
                                <Tooltip content="Add badge">
                                  <Link
                                    href={`/admin/seasons/${season_id}/add-badges?series=${seriesItem.id}`}
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
                            {seriesItem.status === 'init' ? (
                              <Tag variant="blue">Created</Tag>
                            ) : seriesItem.status === 'end' ? (
                              <Tag variant="red">Ended</Tag>
                            ) : seriesItem.status === 'active' ? (
                              <Tag variant="green">Started</Tag>
                            ) : (
                              <></>
                            )}
                          </TableCell>
                          <TableCell className="flex justify-end gap-2">
                            {seriesItem.status === 'init' ? (
                              <>
                                <Button
                                  variant="secondary"
                                  size="md"
                                  onClick={async () => {
                                    await startSeries({
                                      session: session!,
                                      agg_symbol: decodeURIComponent(
                                        season_id as string
                                      ),
                                      seq_ids: [seriesItem.id],
                                    })
                                    seriesQuery.refetch()
                                  }}
                                >
                                  Start
                                </Button>
                              </>
                            ) : seriesItem.status === 'end' ? (
                              <></>
                            ) : seriesItem.status === 'active' ? (
                              <>
                                <Button
                                  variant="secondary"
                                  size="md"
                                  onClick={() => {
                                    endSeries({
                                      session: session!,
                                      agg_symbol: decodeURIComponent(
                                        season_id as string
                                      ),
                                      seq_ids: [seriesItem.id],
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
