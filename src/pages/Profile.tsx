import { useEffect, useState } from 'react'
import { MdOutlineModeEdit } from 'react-icons/md'
import { useParams } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { BadgeSection } from '@/components/ui/BadgeSection'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { SeasonalBadgeSection } from '@/components/ui/SeasonalBadgeSection'
import { useBadges } from '@/hooks/badges'
import { useSeasons } from '@/hooks/seasons'
import { BadgeFilterType, BadgeType } from '@/models/badges'
import { AchievementType } from '@/models/seasons'

export function Profile() {
  const [badges, setBadges] = useState([] as BadgeType[])
  const [seasonalBadges, setSeasonalBadges] = useState([] as AchievementType[])

  const { userBadges } = useBadges()
  const { orgAggregates, userSeasonalBadges } = useSeasons()
  const { user } = useParams()

  useEffect(() => {
    async function getBadges() {
      const [responseBadges, responseSeasonal] = await Promise.all([
        userBadges({
          scope: user,
          queryType: BadgeFilterType.DEFAULT,
          lowerBound: '',
          upperBound: ''
        }),
        userSeasonalBadges({
          scope: user,
          queryType: BadgeFilterType.DEFAULT,
          lowerBound: '',
          upperBound: ''
        })
      ])

      if (responseBadges?.rows?.length) {
        setBadges(responseBadges.rows)
      }

      if (responseSeasonal?.rows?.length) {
        setSeasonalBadges(responseSeasonal.rows)
      }
    }

    if (user) {
      getBadges()
    }
  }, [user, userBadges, userSeasonalBadges])

  const badgesCount = badges.reduce((sum, badge) => parseInt(badge.balance.split(' ', 1)[0]) + sum, 0) ?? 0
  const seasonalBadgesCount = seasonalBadges.reduce((sum, badge) => badge.count + sum, 0) ?? 0

  return (
    <div className="mx-auto max-w-container-md space-y-8 py-8 mobile:pt-0 desktop:px-4">
      <Box className="divide-y divide-gray-2 overflow-hidden p-0 mobile:rounded-none mobile:border-0 mobile:bg-black">
        <div className="relative h-52 w-full bg-gradient">
          {/* Later control disabled based on the logged in account vs profile link */}
          <Button variant="secondary" className="absolute right-4 top-4 z-10" disabled>
            <MdOutlineModeEdit className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex gap-4 p-8 mobile:flex-col mobile:px-4 desktop:items-center">
          <Avatar size="lg" className="flex-none ">
            {user ? user.slice(0, 2) : 'un'}
          </Avatar>
          <div className="text-white">
            <h1 className="text-title-2">{user ?? 'unknown'}</h1>
            <div className="mt-2 flex gap-8">
              <p>
                <span className="mb-0.5 block text-body-3 text-gray-3">Lifetime</span>
                <strong className="font-medium">{badgesCount}</strong>
              </p>
              <p>
                <span className="mb-0.5 block text-body-3 text-gray-3">Seasonal</span>
                <strong className="font-medium">{seasonalBadgesCount}</strong>
              </p>
              <p>
                <span className="mb-0.5 block text-body-3 text-gray-3">Total</span>
                <strong className="font-medium">{badgesCount + seasonalBadgesCount}</strong>
              </p>
            </div>
          </div>
        </div>
        <BadgeSection title="Lifetime Badges" badges={badges} />
        {orgAggregates.map((agg, index) => (
          <SeasonalBadgeSection agg={agg} seasonalBadges={seasonalBadges} key={index} />
        ))}
      </Box>
      {/* Enable when message info is available */}
      {/* <Box>
        <h2 className="text-title-1 text-white">Messages</h2>
      </Box> */}
    </div>
  )
}
