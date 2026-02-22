'use client'

import { useMemo, useState } from 'react'

import type { Badge as BadgeType } from '@/api/model/badge'
import { type Series } from '@/api/model/series'
import { Badge } from '@/components/ui/badge'
import { BadgeDetailModal } from '@/components/ui/badge-detail-modal'
import {
  BadgeSwiper,
  BadgeSwiperSlide,
  BadgeSwiperWrapper,
} from '@/components/ui/badge-swiper'
import { Box } from '@/components/ui/box'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'

const LIFETIME_KEY = '__lifetime__'

type SeasonalBadgesSectionProps = {
  lastSeriesId?: number
  name: string
  orgDisplayName?: string
  series: (Series & {
    badges: ({ balance: number } & BadgeType)[]
  })[]
}

export function SeasonalBadgesSection({
  name,
  orgDisplayName,
  series,
}: SeasonalBadgesSectionProps) {
  const [selectedSeries, setSelectedSeries] = useState<
    number | typeof LIFETIME_KEY
  >(LIFETIME_KEY)
  const [selectedBadge, setSelectedBadge] = useState<
    ({ balance: number } & BadgeType) | null
  >(null)

  const lifetimeBadges = useMemo(() => {
    const badgeMap = new Map<
      string,
      { balance: number } & BadgeType
    >()

    for (const s of series) {
      for (const badge of s.badges) {
        const existing = badgeMap.get(badge.badge_symbol)
        if (existing) {
          badgeMap.set(badge.badge_symbol, {
            ...existing,
            balance: existing.balance + badge.balance,
          })
        } else {
          badgeMap.set(badge.badge_symbol, { ...badge })
        }
      }
    }

    return Array.from(badgeMap.values())
  }, [series])

  const isLifetime = selectedSeries === LIFETIME_KEY
  const seriesValue = isLifetime
    ? null
    : series.find((s) => s.seq_id === selectedSeries)
  const displayBadges = isLifetime
    ? lifetimeBadges
    : seriesValue?.badges ?? []
  const dropdownLabel = isLifetime
    ? 'Lifetime'
    : seriesValue?.sequence_description

  return (
    <section className="py-8">
      <header className="mb-4 flex items-center justify-between gap-4 px-8 max-md:px-4">
        <h3 className="text-title-2 text-white">
          {name}
          {orgDisplayName && (
            <span className="text-gray-3"> — {orgDisplayName}</span>
          )}{' '}
          <span className="text-gray-3">
            {displayBadges.length > 0 ? `(${displayBadges.length})` : null}
          </span>
        </h3>
        {series.length > 0 && (
          <DropdownRoot label={dropdownLabel} align="end">
            <DropdownItem
              isSelected={isLifetime}
              onClick={() => setSelectedSeries(LIFETIME_KEY)}
            >
              Lifetime
            </DropdownItem>
            {series.map((s) => (
              <DropdownItem
                key={s.seq_id}
                isSelected={s.seq_id === selectedSeries}
                onClick={() => setSelectedSeries(s.seq_id)}
              >
                {s.sequence_description}
              </DropdownItem>
            ))}
          </DropdownRoot>
        )}
      </header>
      {displayBadges.length > 0 ? (
        <>
          <BadgeSwiper>
            <BadgeSwiperWrapper>
              {displayBadges.map((badge) => (
                <BadgeSwiperSlide key={badge.badge_symbol}>
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <Badge
                      name={badge.onchain_lookup_data.user.display_name}
                      balance={String(badge.balance)}
                      ipfs={badge.offchain_lookup_data.user.ipfs_image}
                    />
                  </button>
                </BadgeSwiperSlide>
              ))}
            </BadgeSwiperWrapper>
          </BadgeSwiper>
          <BadgeDetailModal
            open={!!selectedBadge}
            onOpenChange={(open) => {
              if (!open) setSelectedBadge(null)
            }}
            badgeSymbol={selectedBadge?.badge_symbol ?? ''}
            badge={selectedBadge ?? undefined}
          />
        </>
      ) : (
        <div className="px-8 max-md:px-4">
          <Box className="flex h-50 w-full items-center justify-center text-center">
            <p className="text-body-2 text-gray-3">No Badges received yet</p>
          </Box>
        </div>
      )}
    </section>
  )
}
