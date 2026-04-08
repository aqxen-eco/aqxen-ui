'use client'

import { useTranslations } from 'next-intl'
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
import { useTranslateBadgeName } from '@/hooks/use-translate-badge-name'

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
  const t = useTranslations('profile')
  const translateBadgeName = useTranslateBadgeName()
  const [selectedBadge, setSelectedBadge] = useState<LifetimeBadge | null>(null)

  return (
    <section className="py-8">
      <header className="mb-4 px-8 max-md:px-4">
        <h3 className="text-title-2 text-white">
          {t('lifetime', { label })}{' '}
          <span className="text-gray-3">{t('earned', { count: badges.length, label: label.toLowerCase() })}</span>
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
                  size="md"
                  name={translateBadgeName(badge.onchain_lookup_data.user.display_name)}
                  balance={String(badge.balance)}
                  ipfs={badge.offchain_lookup_data.user.ipfs_image}
                  label={label === t('tabBeams') ? t('beam') : t('badge')}
                  balanceLabel={label === t('tabBeams') ? t('rep') : undefined}
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
