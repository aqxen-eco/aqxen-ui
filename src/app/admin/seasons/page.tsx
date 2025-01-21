'use client'

import { useQueries } from '@tanstack/react-query'
import { MdKeyboardArrowRight } from 'react-icons/md'

import { listBadge } from '@/api/chain/badge'
import { listSeason } from '@/api/chain/season'
import { listSeries } from '@/api/chain/series'
import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { TableSkeleton } from '@/components/skeleton'
import { BadgeImage } from '@/components/ui/badge-image'
import { Link } from '@/components/ui/link'
import { Select, SelectItem } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip } from '@/components/ui/tooltip'
import { useOrganization } from '@/contexts/organization'

export default function SeasonsPage() {
  const { name, symbol } = useOrganization()

  const [seasonsQuery, badgesQuery] = useQueries({
    queries: [
      {
        queryKey: ['seasons', name, symbol],
        queryFn: async () =>
          await listSeason({
            scope: name,
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
    ],
  })

  const seriesQueries = useQueries({
    queries:
      seasonsQuery.data?.rows.map((season) => {
        const seasonId = season.id.split(',')[1]
        return {
          queryKey: ['series', seasonId],
          queryFn: async () =>
            await listSeries({
              scope: seasonId,
            }),
        }
      }) ?? [],
  })

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/seasons" />
        <HeaderAdminTitle title="Seasons" tooltip="Lorem ipsum dolor sit amed">
          <Link href="/admin/new-season" variant="primary" size="md">
            New season
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <div className="mx-auto min-h-[calc(100vh-24rem)] max-w-container-lg px-4 pb-8">
        {seasonsQuery.isLoading && <TableSkeleton columns={6} />}
        {(seasonsQuery.isSuccess ||
          (seasonsQuery.data && seasonsQuery.data.rows.length > 0)) && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Sym</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Badges</TableHead>
                <TableHead>Last created series</TableHead>
                <TableHead>Last started series</TableHead>
                <TableHead>Last ended series</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasonsQuery.data.rows.map((season, seasonIndex) => (
                <TableRow key={season.id}>
                  <TableCell className="text-gray-3">{season.symbol}</TableCell>
                  <TableCell>{season.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {badgesQuery?.data?.rows.map(
                        (badge) =>
                          season.badges.includes(badge.id) && (
                            <Tooltip
                              content={badge.name}
                              key={badge.id}
                              className="capitalize"
                            >
                              <BadgeImage src={badge.ipfs} size="xs" />
                            </Tooltip>
                          )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {seriesQueries?.[seasonIndex]?.data?.rows.map(
                      (serie) =>
                        season.last_created_series.at(-1) === serie.id &&
                        serie.name
                    )}
                  </TableCell>
                  <TableCell>
                    {seriesQueries?.[seasonIndex]?.data?.rows.map(
                      (serie) =>
                        season.last_started_series.at(-1) === serie.id &&
                        serie.name
                    )}
                  </TableCell>
                  <TableCell>
                    {seriesQueries?.[seasonIndex]?.data?.rows.map(
                      (serie) =>
                        season.last_ended_series.at(-1) === serie.id &&
                        serie.name
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/seasons/${season.id}`}
                      size="md"
                      variant="secondary"
                      square
                    >
                      <MdKeyboardArrowRight className="size-6" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {seasonsQuery.data.more && (
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={Object.keys(seasonsQuery.data.rows[0]).length + 1}
                  >
                    <div className="flex items-center justify-center gap-2 pt-8 text-body-2 text-white">
                      Page
                      <Select label="Page" placeholder="Page" defaultValue="1">
                        {['1', '2', '3', '4', '5', '6'].map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </Select>
                      of 6
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        )}
      </div>
    </>
  )
}
