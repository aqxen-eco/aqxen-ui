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
import { IPFS_IMAGE_SOURCE } from '@/constants'

type LifetimeBadge = {
  balance: number
  orgName?: string
  orgIpfsImage?: string
  orgAccountName?: string
} & BadgeType

type LifetimeBadgesSectionProps = {
  badges: LifetimeBadge[]
  showOrgOverlay?: boolean
  label?: string
  scope?: string
}

export function LifetimeBadgesSection({
  badges,
  showOrgOverlay,
  label = 'Badges',
  scope,
}: LifetimeBadgesSectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<LifetimeBadge | null>(null)

  return (
    <section className="py-8">
      <header className="mb-4 px-8 max-md:px-4">
        <h3 className="text-title-2 text-white">
          Lifetime {label}{' '}
          <span className="text-gray-3">({badges.length} {label.toLowerCase()} earned)</span>
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
                  label={label === 'Beams' ? 'beam' : 'badge'}
                  balanceLabel={label === 'Beams' ? 'rep' : undefined}
                  badgeSymbol={badge.badge_symbol}
                  orgOverlaySrc={
                    showOrgOverlay && badge.orgIpfsImage
                      ? IPFS_IMAGE_SOURCE + badge.orgIpfsImage
                      : undefined
                  }
                  orgOverlayInitials={
                    showOrgOverlay && badge.orgName
                      ? badge.orgName.slice(0, 2).toUpperCase()
                      : undefined
                  }
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
        scope={scope ?? selectedBadge?.orgAccountName}
        badge={selectedBadge ?? undefined}
      />
    </section>
  )
}
