'use client'

import type { Badge as BadgeType } from '@/api/model/badge'
import type { Season } from '@/api/model/season'
import type { Series } from '@/api/model/series'
import { Avatar } from '@/components/ui/avatar'
import { IPFS_IMAGE_SOURCE } from '@/constants'

import { LifetimeBadgesSection } from './lifetime-badges-section'
import { SeasonalBadgesSection } from './seasonal-badges-section'

type OrgBadgesSectionProps = {
  orgAccount: string
  displayName: string
  ipfsImage: string
  badges: ({
    balance: number
    orgName?: string
    orgIpfsImage?: string
    orgAccountName?: string
  } & BadgeType)[]
  seasons: (Season & {
    series: (Series & { badges: ({ balance: number } & BadgeType)[] })[]
    orgDisplayName: string
    orgIpfsImage: string
    orgAccountName: string
  })[]
}

export function OrgBadgesSection({
  displayName,
  ipfsImage,
  badges,
  seasons,
}: OrgBadgesSectionProps) {
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <section className="border-gray-2 border-t">
      <header className="flex items-center gap-3 px-8 pt-8 max-md:px-4">
        <Avatar
          size="sm"
          color="blue"
          src={ipfsImage ? `${IPFS_IMAGE_SOURCE}${ipfsImage}` : undefined}
        >
          {initials}
        </Avatar>
        <h3 className="text-title-2 text-white">{displayName}</h3>
      </header>

      {badges.length > 0 && <LifetimeBadgesSection badges={badges} />}

      {seasons.map((season) => (
        <SeasonalBadgesSection
          key={season.agg_symbol}
          lastSeriesId={season.active_seq_ids.at(-1)}
          name={season.onchain_lookup_data.user.display_name}
          series={season.series}
        />
      ))}

      {badges.length === 0 && seasons.length === 0 && (
        <div className="px-8 py-8 max-md:px-4">
          <p className="text-body-2 text-gray-3">No badges yet.</p>
        </div>
      )}
    </section>
  )
}
