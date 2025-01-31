'use client'

import { useState } from 'react'

import { type Series } from '@/api/chain/series'
import type { Badge as BadgeType } from '@/api/model/badge'
import { Badge } from '@/components/ui/badge'
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
  badges: BadgeType[]
  series: Series[]
}

export function SeasonalBadgesSection({
  name,
  lastSeriesId,
  badges,
  series,
}: SeasonalBadgesSectionProps) {
  const [selectedSeries, setSelectedSeries] = useState(lastSeriesId)

  // const seasonIdFormatted = seasonId.split(',')[1]

  // const seriesQueries = useQuery({
  //   queryKey: ['series', seasonIdFormatted],
  //   queryFn: async () =>
  //     await listSeries({
  //       scope: seasonIdFormatted,
  //     }),
  // })

  console.log(series)

  return (
    <section className="py-8">
      <header className="mb-4 flex items-center justify-between gap-4 px-8 mobile:px-4">
        <h3 className="text-title-2 text-white">
          {name} <span className="text-gray-3">({badges.length})</span>
        </h3>
        {series.length > 0 && (
          <DropdownRoot
            label={series.find((series) => series.id === selectedSeries)?.name}
            align="end"
          >
            {series.map((series) => (
              <DropdownItem
                key={series.id}
                isSelected={series.id === selectedSeries}
                onClick={() => {
                  setSelectedSeries(series.id)
                }}
              >
                {series.name}
              </DropdownItem>
            ))}
          </DropdownRoot>
        )}
      </header>
      {badges.length > 0 ? (
        <BadgeSwiper>
          <BadgeSwiperWrapper>
            {badges.map((badge) => (
              <BadgeSwiperSlide key={badge.id}>
                <Badge name={badge.name} balance="0" ipfs={badge.ipfs} />
              </BadgeSwiperSlide>
            ))}
          </BadgeSwiperWrapper>
        </BadgeSwiper>
      ) : (
        <div className="px-8 mobile:px-4">
          <Box className="flex h-[12.5rem] w-full items-center justify-center text-center">
            <p className="text-body-2 text-gray-3">No Badges received yet</p>
          </Box>
        </div>
      )}
    </section>
  )
}
