'use client'

import { useQueries } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { toast } from 'react-toastify'

import { listBadge } from '@/api/chain/badge/list-badge'
import { disableBadgeAutomation } from '@/api/chain/badge-automation/disable-badge-automation'
import { enableBadgeAutomation } from '@/api/chain/badge-automation/enable-badge-automation'
import { listBadgeAutomation } from '@/api/chain/badge-automation/list-badge-automation'
import { Badge } from '@/api/model/badge'
import { TableSkeleton } from '@/components/skeleton'
import { BadgeImage } from '@/components/ui/badge-image'
import { Button } from '@/components/ui/button'
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
import { useTranslateBadgeName } from '@/hooks/use-translate-badge-name'

export default function BadgeAutomationPage() {
  const t = useTranslations('admin.badgeAutomation')
  const tc = useTranslations('admin.common')
  const { actor, session } = useChain()
  const { name, symbol } = useOrganization()
  const translateBadgeName = useTranslateBadgeName()

  const [badgeAutomationQuery, badgesQuery] = useQueries({
    queries: [
      {
        queryKey: ['badge-automation', actor],
        queryFn: async () => await listBadgeAutomation({ scope: actor }),
      },
      {
        queryKey: ['badges', name],
        queryFn: async () => await listBadge({ scope: name }),
      },
    ],
  })

  if (badgeAutomationQuery.isLoading || badgesQuery.isLoading) {
    return <TableSkeleton />
  }

  if (
    !badgeAutomationQuery.data ||
    badgeAutomationQuery.data.rows.length === 0 ||
    !badgesQuery.data ||
    badgesQuery.data.rows.length === 0
  ) {
    return null
  }

  const data = badgeAutomationQuery.data.rows.map((row) => {
    const emitAssetsBadge = row.emit_assets.map((item) => {
      const [quantity, symbol] = item.emit_asset.split(' ')
      return {
        quantity,
        symbol,
      }
    })
    const emitterCriteriaBadge = row.emitter_criteria.map((item) => {
      const [quantity, symbol] = item.value.split(' ')
      return {
        quantity,
        symbol,
      }
    })

    const { emit_assets, emitter_criteria } = badgesQuery.data.rows.reduce(
      (acc, crr) => {
        const badgeSymbol = crr.badge_symbol.split(',')[1]

        const emitAssetsBadgeItem = emitAssetsBadge.find(
          (item) => item.symbol === badgeSymbol
        )
        const emitterCriteriaBadgeItem = emitterCriteriaBadge.find(
          (item) => item.symbol === badgeSymbol
        )
        if (emitAssetsBadgeItem) {
          acc.emit_assets.push({
            ...crr,
            quantity: emitAssetsBadgeItem.quantity,
          })
        }

        if (emitterCriteriaBadgeItem) {
          acc.emitter_criteria.push({
            ...crr,
            quantity: emitterCriteriaBadgeItem.quantity,
          })
        }

        return acc
      },
      {
        emit_assets: [],
        emitter_criteria: [],
      } as {
        emit_assets: ({ quantity: string } & Badge)[]
        emitter_criteria: ({ quantity: string } & Badge)[]
      }
    )

    return {
      ...row,
      emit_assets,
      emitter_criteria,
      emission_symbol_formatted: row.emission_symbol
        .split(',')[1]
        .replace(symbol.toUpperCase(), ''),
    }
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">{tc('sym')}</TableHead>
          <TableHead>{tc('name')}</TableHead>
          <TableHead>{t('emitterCriteria')}</TableHead>
          <TableHead>{t('emitBadges')}</TableHead>
          <TableHead className="w-32">{tc('status')}</TableHead>
          <TableHead className="w-40" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.emission_symbol}>
            <TableCell className="text-gray-3">
              {row.emission_symbol_formatted}
            </TableCell>
            <TableCell className="space-x-2">
              <span className="inline-block">
                {translateBadgeName(row.onchain_lookup_data.user.name)}
              </span>
              {row.cyclic && <Tag>{tc('cyclic')}</Tag>}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {row.emitter_criteria.map((badge) => (
                  <div
                    key={badge.badge_symbol}
                    className="flex items-center gap-2"
                  >
                    <BadgeImage
                      src={badge.offchain_lookup_data.user.ipfs_image}
                      size="xs"
                      badgeSymbol={badge.badge_symbol}
                      displayName={badge.onchain_lookup_data.user.display_name}
                    />
                    <span className="text-body-2 text-gray-3">
                      {badge.quantity}
                    </span>
                    <Tooltip
                      content={translateBadgeName(badge.onchain_lookup_data.user.display_name)}
                    >
                      <span className="text-body-2 text-white">
                        {badge.badge_symbol.split(',')[1]}
                      </span>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {row.emit_assets.map((badge) => (
                  <div
                    key={badge.badge_symbol}
                    className="flex items-center gap-2"
                  >
                    <BadgeImage
                      src={badge.offchain_lookup_data.user.ipfs_image}
                      size="xs"
                      badgeSymbol={badge.badge_symbol}
                      displayName={badge.onchain_lookup_data.user.display_name}
                    />
                    <span className="text-body-2 text-gray-3">
                      {badge.quantity}
                    </span>
                    <Tooltip
                      content={translateBadgeName(badge.onchain_lookup_data.user.display_name)}
                    >
                      <span className="text-body-2 text-white">
                        {badge.badge_symbol.split(',')[1]}
                      </span>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {row.status === 'init' && <Tag variant="green">{t('created')}</Tag>}
              {row.status === 'activate' && <Tag variant="green">{t('enabled')}</Tag>}
              {row.status === 'deactivate' && <Tag variant="red">{t('disabled')}</Tag>}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button asChild variant="secondary" size="md">
                  <Link
                    href={`/admin/new-badge-automation?edit=${encodeURIComponent(row.emission_symbol)}`}
                  >
                    {tc('edit')}
                  </Link>
                </Button>
                {row.status === 'activate' && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={async () => {
                      try {
                        await disableBadgeAutomation({
                          session: session!,
                          emission_symbol: row.emission_symbol,
                        })
                        toast.success(t('disableSuccess'))
                        setTimeout(
                          () => badgeAutomationQuery.refetch(),
                          1000
                        )
                      } catch {
                        toast.error(t('disableFailed'))
                      }
                    }}
                  >
                    {tc('disable')}
                  </Button>
                )}
                {(row.status === 'init' || row.status === 'deactivate') && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={async () => {
                      try {
                        await enableBadgeAutomation({
                          session: session!,
                          emission_symbol: row.emission_symbol,
                        })
                        toast.success(t('enableSuccess'))
                        setTimeout(
                          () => badgeAutomationQuery.refetch(),
                          1000
                        )
                      } catch {
                        toast.error(t('enableFailed'))
                      }
                    }}
                  >
                    {tc('enable')}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
