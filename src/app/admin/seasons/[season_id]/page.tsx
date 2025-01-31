'use client'

import { useQueries } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { MdOutlineAdd, MdOutlineInfo } from 'react-icons/md'

import { listBadge } from '@/api/chain/badge'
import { listBadgeStatus } from '@/api/chain/badge/list-badge-status'
import { listSeason } from '@/api/chain/season'
import { listSeries } from '@/api/chain/series'
import { endSeries } from '@/api/chain/series/end-series'
import { startSeries } from '@/api/chain/series/start-series'
import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { BadgeImage } from '@/components/ui/badge-image'
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

  // const seasonBadgesStatus = badgesStatusQuery.data?.rows.reduce(
  //   (accumulate, currentValue) => {
  //     if (currentValue.agg_symbol === decodeURIComponent(season_id as string)) {
  //       accumulate[currentValue.seq_id] = [
  //         accumulate[currentValue.seq_id],
  //         currentValue,
  //       ]
  //       return accumulate
  //     }
  //     return accumulate
  //   },
  //   {} as Record<string, Record<any, any>[]>
  // )

  // console.log(seasonBadgesStatus)

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/seasons">Seasons</HeaderAdminBack>
        <HeaderAdminTitle title={seasonQuery?.data?.rows?.[0]?.name ?? ''} />
      </HeaderAdmin>
      <div className="by-8 mx-auto max-w-container-lg space-y-8 px-4 pb-8">
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
          {(badgesQuery.isSuccess ||
            (badgesQuery.data && badgesQuery.data.rows.length > 0)) && (
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
                    seasonQuery?.data?.rows?.[0]?.badges.includes(badge.id) && (
                      <TableRow key={badge.symbol}>
                        <TableCell className="text-gray-3">
                          {badge.symbol}
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-2">
                            <BadgeImage src={badge.ipfs} size="xs" />
                            <span className="text-nowrap font-sans text-body-2 font-medium capitalize text-white">
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
                href={`/admin/seasons/${season_id}/add-series`}
                variant="secondary"
                size="md"
              >
                Add series
              </Link>
            </div>
          </header>
          {(seriesQuery.isSuccess ||
            (seriesQuery.data && seriesQuery.data.rows.length > 0)) && (
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
                {seriesQuery.data.rows.map((serie) => (
                  <TableRow key={serie.id}>
                    <TableCell className="text-center text-gray-3">
                      {serie.id}
                    </TableCell>
                    <TableCell>{serie.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Tooltip content="Lorem" className="capitalize">
                          <BadgeImage src="" size="xs" />
                        </Tooltip>
                        <Tooltip content="Lorem" className="capitalize">
                          <BadgeImage src="" size="xs" />
                        </Tooltip>
                        {serie.status !== 'end' && (
                          <Tooltip content="Add badge">
                            <Link
                              href={`/admin/seasons/${season_id}/add-badges?series=${serie.id}`}
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
                      {serie.status === 'init' ? (
                        <Tag variant="blue">Created</Tag>
                      ) : serie.status === 'end' ? (
                        <Tag variant="red">Ended</Tag>
                      ) : serie.status === 'active' ? (
                        <Tag variant="green">Started</Tag>
                      ) : (
                        <></>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      {serie.status === 'init' ? (
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
                                seq_ids: [serie.id],
                              })
                              seriesQuery.refetch()
                            }}
                          >
                            Start
                          </Button>
                          {/* <Button
                            variant="secondary"
                            size="md"
                            onClick={() =>
                              resumeSeries({
                                session: session!,
                                agg_symbol: decodeURIComponent(
                                  season_id as string
                                ),
                                seq_id: String(serie.id),
                              })
                            }
                          >
                            Resume
                          </Button>
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() =>
                              endSeries({
                                session: session!,
                                agg_symbol: decodeURIComponent(
                                  season_id as string
                                ),
                                seq_ids: [String(serie.id)],
                              })
                            }
                          >
                            End
                          </Button> */}
                        </>
                      ) : serie.status === 'end' ? (
                        <></>
                      ) : serie.status === 'active' ? (
                        <>
                          {/* <Button
                            variant="secondary"
                            size="md"
                            onClick={async () => {
                              try {
                                await pauseSeries({
                                  session: session!,
                                  agg_symbol: decodeURIComponent(
                                    season_id as string
                                  ),
                                  seq_id: serie.id,
                                })
                                seriesQuery.refetch()
                              } catch (error) {
                                console.log(error)
                              }
                            }}
                          >
                            Pause
                          </Button> */}
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => {
                              endSeries({
                                session: session!,
                                agg_symbol: decodeURIComponent(
                                  season_id as string
                                ),
                                seq_ids: [serie.id],
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
          )}
        </section>
      </div>
    </>
  )
}
