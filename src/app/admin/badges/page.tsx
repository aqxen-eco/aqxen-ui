'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { listBadge } from '@/api/chain/badge/list-badge'
import { listBeamMetadata } from '@/api/chain/beams/list-beam-metadata'
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
import { useOrganization } from '@/contexts/organization'
import { useIntlLocale } from '@/hooks/use-date-locale'
import { useTranslateBadgeName } from '@/hooks/use-translate-badge-name'
import { getBeamWithTrackingBadges } from '@/utils/get-beam-tracking-badges'
import { formatNumber } from '@/utils/intl-format'

export default function BadgesPage() {
  const t = useTranslations('admin.badgesPage')
  const tc = useTranslations('admin.common')
  const { name, symbol, removeOrganizationSymbol } = useOrganization()
  const intlLocale = useIntlLocale()
  const translateBadgeName = useTranslateBadgeName()
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  const query = useQuery({
    queryKey: ['badges', name],
    queryFn: async () => await listBadge({ scope: name }),
  })

  const beamsQuery = useQuery({
    queryKey: ['beams', name],
    queryFn: async () => await listBeamMetadata({ scope: name }),
  })

  const beamAndTrackingSymbols = useMemo(() => {
    if (!query.data?.rows) return new Set<string>()

    const beamSymbols = beamsQuery.data?.map((b) => b.badge_symbol) ?? []
    const allBadgeSymbols = query.data.rows.map((b) => b.badge_symbol)
    const excluded = getBeamWithTrackingBadges(beamSymbols, allBadgeSymbols)

    const orgPrefix = symbol.toUpperCase()
    const reliabilitySuffixes = ['GRL', 'RRL', 'URL']
    for (const suffix of reliabilitySuffixes) {
      excluded.push(`0,${orgPrefix}${suffix}`)
    }

    return new Set(excluded)
  }, [query.data, beamsQuery.data, symbol])

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/badges" />
        <HeaderAdminTitle title={t('title')} tooltip={t('tooltip')}>
          <Link href="/admin/new-badge" variant="primary" size="md">
            {t('newBadge')}
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        {query.isLoading && <TableSkeleton />}
        {query.isSuccess && query.data.rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">{tc('sym')}</TableHead>
                <TableHead>{tc('name')}</TableHead>
                <TableHead className="w-40 text-center">
                  {t('totalAwarded')}
                </TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.rows.map((row) => (
                <TableRow key={row.badge_symbol}>
                  <TableCell className="text-gray-3">
                    {removeOrganizationSymbol(row.badge_symbol)}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-2"
                      onClick={() => setSelectedBadge(row)}
                    >
                      <BadgeImage
                        src={row.offchain_lookup_data.user.ipfs_image}
                        size="xs"
                        badgeSymbol={row.badge_symbol}
                        displayName={row.onchain_lookup_data.user.display_name}
                      />
                      <span className="text-body-2 font-sans font-medium text-nowrap text-white hover:underline">
                        {translateBadgeName(row.onchain_lookup_data.user.display_name)}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(Number(row.rarity_counts), intlLocale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setSelectedBadge(row)}
                      >
                        {tc('details')}
                      </Button>
                      {!beamAndTrackingSymbols.has(row.badge_symbol) && (
                        <Link
                          href={`/admin/badges/${row.badge_symbol}/send-badge`}
                          variant="secondary"
                          size="md"
                        >
                          {tc('send')}
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {query.data?.more && (
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={Object.keys(query.data.rows[0]).length + 1}
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
      <BadgeDetailModal
        open={!!selectedBadge}
        onOpenChange={(open) => {
          if (!open) setSelectedBadge(null)
        }}
        badgeSymbol={selectedBadge?.badge_symbol ?? ''}
        scope={name}
        badge={selectedBadge ?? undefined}
      />
    </>
  )
}
