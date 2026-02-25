'use client'

import { useQueries } from '@tanstack/react-query'
import { MdKeyboardArrowRight } from 'react-icons/md'

import { listBadge } from '@/api/chain/badge/list-badge'
import { listSeason } from '@/api/chain/season/list-season'
import { listSeries } from '@/api/chain/series/list-series'
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
  const { name, removeOrganizationSymbol } = useOrganization()

  const [seasonsQuery, badgesQuery] = useQueries({
    queries: [
      {
        queryKey: ['seasons', name],
        queryFn: async () => await listSeason({ scope: name }),
      },
      {
        queryKey: ['badges', name],
        queryFn: async () => await listBadge({ scope: name }),
      },
    ],
  })

  const seriesQueries = useQueries({
    queries:
      seasonsQuery.data?.rows.map((season) => {
        const seasonId = season.agg_symbol.split(',')[1]
        return {
          queryKey: ['series', seasonId],
          queryFn: async () => await listSeries({ scope: seasonId }),
        }
      }) ?? [],
  })

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/seasons" />
        <HeaderAdminTitle title="Seasons" tooltip="Review your active and historical seasons. Seasons allow you to track and reset user reputation over set timeframes.">
          <Link href="/admin/new-season" variant="primary" size="md">
            New season
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
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
                <TableRow key={season.agg_symbol}>
                  <TableCell className="text-gray-3">
                    {removeOrganizationSymbol(season.agg_symbol)}
                  </TableCell>
                  <TableCell>
                    {season.onchain_lookup_data.user.display_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {badgesQuery?.data?.rows.map(
                        (badge) =>
                          season.init_badge_symbols.includes(
                            badge.badge_symbol
                          ) && (
                            <Tooltip
                              content={
                                badge.onchain_lookup_data.user.display_name
                              }
                              key={badge.badge_symbol}
                            >
                              <div>
                                <BadgeImage
                                  src={
                                    badge.offchain_lookup_data.user.ipfs_image
                                  }
                                  size="xs"
                                  alt={
                                    badge.onchain_lookup_data.user.display_name
                                  }
                                />
                              </div>
                            </Tooltip>
                          )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {seriesQueries?.[seasonIndex]?.data?.rows.map(
                      (serie) =>
                        season.last_init_seq_id === serie.seq_id &&
                        serie.sequence_description
                    )}
                  </TableCell>
                  <TableCell>
                    {seriesQueries?.[seasonIndex]?.data?.rows.map(
                      (serie) =>
                        season.active_seq_ids.at(-1) === serie.seq_id &&
                        serie.sequence_description
                    )}
                  </TableCell>
                  <TableCell>
                    {seriesQueries?.[seasonIndex]?.data?.rows.map(
                      (serie) =>
                        season.end_seq_ids.at(-1) === serie.seq_id &&
                        serie.sequence_description
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/seasons/${season.agg_symbol}`}
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
                    <div className="text-body-2 flex items-center justify-center gap-2 pt-8 text-white">
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
