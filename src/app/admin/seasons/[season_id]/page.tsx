'use client'

import { useQueries } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { MdOutlineAdd, MdOutlineInfo } from 'react-icons/md'

import { listBadge } from '@/api/chain/badge'
import { listSeason } from '@/api/chain/season'
import { listSeries } from '@/api/chain/series'
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
import { useOrganization } from '@/contexts/organization'

export default function SeasonPage() {
  const { name, symbol } = useOrganization()
  const { season_id } = useParams()
  const seasonId = decodeURIComponent(season_id as string).split(',')[1]

  const [seasonQuery, badgesQuery, seriesQuery] = useQueries({
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
        queryKey: ['series', seasonId],
        queryFn: async () =>
          await listSeries({
            scope: seasonId,
          }),
      },
    ],
  })

  if (seasonQuery.isPending || badgesQuery.isPending || seriesQuery.isPending) {
    return null
  }

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
                            <Button variant="secondary" size="md" square>
                              <MdOutlineAdd className="size-6" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {serie.status === 'init' ? (
                        <Tag variant="yellow">Paused</Tag>
                      ) : serie.status === 'end' ? (
                        <Tag variant="red">Ended</Tag>
                      ) : serie.status === 'active' ? (
                        <Tag variant="green">Started</Tag>
                      ) : (
                        <Tag variant="blue">Created</Tag>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      {serie.status === 'init' ? (
                        <>
                          <Button variant="secondary" size="md">
                            Resume
                          </Button>
                          <Button variant="secondary" size="md">
                            End
                          </Button>
                        </>
                      ) : serie.status === 'end' ? (
                        <></>
                      ) : serie.status === 'active' ? (
                        <>
                          <Button variant="secondary" size="md">
                            Pause
                          </Button>
                          <Button variant="secondary" size="md">
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
