'use client'

import { useQueries } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

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
import { useTranslateBadgeName } from '@/hooks/use-translate-badge-name'

export default function SeasonsPage() {
  const t = useTranslations('admin.seasonsPage')
  const tc = useTranslations('admin.common')
  const tn = useTranslations('admin.nav')
  const { name, removeOrganizationSymbol } = useOrganization()
  const translateBadgeName = useTranslateBadgeName()

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
        <HeaderAdminTitle title={t('title')} tooltip={t('tooltip')}>
          <Link href="/admin/new-season" variant="primary" size="md">
            {t('newSeason')}
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
                <TableHead className="w-10">{tc('sym')}</TableHead>
                <TableHead>{tc('name')}</TableHead>
                <TableHead className="max-w-[17rem]">{tn('badges')}</TableHead>
                <TableHead>{t('lastCreatedSeries')}</TableHead>
                <TableHead>{t('lastStartedSeries')}</TableHead>
                <TableHead>{t('lastEndedSeries')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasonsQuery.data.rows.map((season, seasonIndex) => (
                <TableRow key={season.agg_symbol}>
                  <TableCell className="text-gray-3">
                    {removeOrganizationSymbol(season.agg_symbol)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/seasons/${season.agg_symbol}`}
                      variant="link"
                      size="md"
                    >
                      {season.onchain_lookup_data.user.display_name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[17rem]">
                    <div className="flex flex-wrap gap-2">
                      {badgesQuery?.data?.rows.map(
                        (badge) =>
                          season.init_badge_symbols.includes(
                            badge.badge_symbol
                          ) && (
                            <Tooltip
                              content={
                                translateBadgeName(badge.onchain_lookup_data.user.display_name)
                              }
                              key={badge.badge_symbol}
                            >
                              <div>
                                <BadgeImage
                                  src={
                                    badge.offchain_lookup_data.user.ipfs_image
                                  }
                                  size="xs"
                                  badgeSymbol={badge.badge_symbol}
                                  displayName={badge.onchain_lookup_data.user.display_name}
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
                      {tc('page')}
                      <Select label={tc('page')} placeholder={tc('page')} defaultValue="1">
                        {['1', '2', '3', '4', '5', '6'].map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </Select>
                      {tc('ofPages', { count: 6 })}
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
