'use client'

import { useState } from 'react'

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
  lastSeriesId,
  series,
}: SeasonalBadgesSectionProps) {
  const [selectedSeries, setSelectedSeries] = useState(lastSeriesId)
  const [selectedBadge, setSelectedBadge] = useState<
    ({ balance: number } & BadgeType) | null
  >(null)

  const seriesValue = series.find((series) => series.seq_id === selectedSeries)

  return (
    <section className="py-8">
      <header className="mb-4 flex items-center justify-between gap-4 px-8 max-md:px-4">
        <h3 className="text-title-2 text-white">
          {name}
          {orgDisplayName && (
            <span className="text-gray-3"> — {orgDisplayName}</span>
          )}{' '}
          <span className="text-gray-3">
            {seriesValue?.badges && seriesValue?.badges.length > 0
              ? `(${seriesValue?.badges.length})`
              : null}
          </span>
        </h3>
        {series.length > 0 && (
          <DropdownRoot label={seriesValue?.sequence_description} align="end">
            {series.map((series) => (
              <DropdownItem
                key={series.seq_id}
                isSelected={series.seq_id === selectedSeries}
                onClick={() => {
                  setSelectedSeries(series.seq_id)
                }}
              >
                {series.sequence_description}
              </DropdownItem>
            ))}
          </DropdownRoot>
        )}
      </header>
      {seriesValue?.badges && seriesValue?.badges.length > 0 ? (
        <>
          <BadgeSwiper>
            <BadgeSwiperWrapper>
              {seriesValue.badges.map((badge) => (
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
