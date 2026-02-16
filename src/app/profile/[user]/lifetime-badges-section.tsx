'use client'

import { useState } from 'react'

import type { Badge as BadgeType } from '@/api/model/badge'
import { Badge } from '@/components/ui/badge'
import { BadgeDetailModal } from '@/components/ui/badge-detail-modal'
import {
  BadgeSwiper,
  BadgeSwiperSlide,
  BadgeSwiperWrapper,
} from '@/components/ui/badge-swiper'

type LifetimeBadge = { balance: number } & BadgeType

type LifetimeBadgesSectionProps = {
  badges: LifetimeBadge[]
}

export function LifetimeBadgesSection({ badges }: LifetimeBadgesSectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null)

  return (
    <section className="py-8">
      <header className="mb-4 px-8 max-md:px-4">
        <h3 className="text-title-2 text-white">
          Lifetime Badges{' '}
          <span className="text-gray-3">({badges.length})</span>
        </h3>
      </header>
      <BadgeSwiper>
        <BadgeSwiperWrapper>
          {badges.map((badge, index) => (
            <BadgeSwiperSlide key={index}>
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
    </section>
  )
}
