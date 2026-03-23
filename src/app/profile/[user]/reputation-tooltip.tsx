'use client'

import { useTranslations } from 'next-intl'
import { MdWorkspacePremium } from 'react-icons/md'

import { Tooltip } from '@/components/ui/tooltip'
import { useIntlLocale } from '@/hooks/use-date-locale'
import { useTranslateBadgeName } from '@/hooks/use-translate-badge-name'
import { formatNumber } from '@/utils/intl-format'

import type { ReputationBreakdown } from './functions'

type ReputationTooltipProps = {
  total: number
  breakdown: ReputationBreakdown
}

export function ReputationTooltip({
  total,
  breakdown,
}: ReputationTooltipProps) {
  const t = useTranslations('profile')
  const intlLocale = useIntlLocale()
  const translateBadgeName = useTranslateBadgeName()

  return (
    <Tooltip
      className="min-w-40"
      content={
        breakdown.length === 0 ? (
          <span className="text-gray-3">{t('noBeamContributions')}</span>
        ) : (
          <div className="space-y-1">
            {breakdown.map((row) => (
              <div key={row.name} className="flex justify-between gap-4">
                <span className="text-white">{translateBadgeName(row.name)}</span>
                <span className="text-gray-3 tabular-nums">{formatNumber(row.score, intlLocale)}</span>
              </div>
            ))}
            <div className="border-gray-2 my-1 border-t" />
            <div className="flex justify-between gap-4">
              <span className="font-medium text-white">{t('total')}</span>
              <span className="font-medium text-white tabular-nums">
                {formatNumber(total, intlLocale)}
              </span>
            </div>
          </div>
        )
      }
    >
      <span className="text-gray-3 flex cursor-default items-center gap-0.5">
        <MdWorkspacePremium className="size-5" />
        <span className="text-body-2">{formatNumber(total, intlLocale)}</span>
      </span>
    </Tooltip>
  )
}
