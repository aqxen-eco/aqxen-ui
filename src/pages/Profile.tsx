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
  const [badgesCount, setBadgesCount] = useState(0)
  const [seasonalBadgesCount, setSeasonalBadgesCount] = useState(0)

  const { userBadges } = useBadges()
  const { orgAggregates, userSeasonalBadges } = useSeasons()
  const { user } = useParams()

  async function getBadges() {
    const response = await userBadges({
      scope: user,
      queryType: BadgeFilterType.DEFAULT,
      lowerBound: '',
      upperBound: ''
    })
    if (response?.rows?.length) {
      setBadges(response.rows)
      setBadgesCount(response.rows.reduce((sum, badge) => parseInt(badge.balance.split(' ', 1)[0]) + sum, 0) ?? 0)
    }

    const responseSeasonal = await userSeasonalBadges({
      scope: user,
      queryType: BadgeFilterType.DEFAULT,
      lowerBound: '',
      upperBound: ''
    })
    if (responseSeasonal?.rows?.length) {
      setSeasonalBadges(responseSeasonal.rows)
      setSeasonalBadgesCount(responseSeasonal.rows.reduce((sum, badge) => badge.count + sum, 0) ?? 0)
    }
  }

  useEffect(() => {
    if (user) {
      getBadges()
    }
  }, [user])

  return (
    <div className="mx-auto max-w-container-md space-y-8 px-4 py-8">
      <Box className="overflow-hidden p-0">
        <div className="relative h-52 w-full bg-gradient">
          {/* Later control disabled based on the logged in account vs profile link */}
          <Button variant="secondary" className="absolute right-4 top-4 z-10" disabled>
            <MdOutlineModeEdit className="h-6 w-6" />
          </Button>
        </div>
        <div className="grid grid-cols-8">
          <div className="col-span-3 border-r border-gray-2 text-body-2">
            <div className="p-8">
              <Avatar size="lg" className="mb-4">
                {user ? user.slice(0, 2) : 'un'}
              </Avatar>
              <h1 className="text-white">{user ?? 'unknown'}</h1>
              {/* Enable when user profile info is available */}
              {/* <h1 className="text-white">User Full Name</h1> */}
              {/* <p className="text-gray-3">user@email.com</p> */}
              {/* <p className="text-gray-3">@userhandle</p> */}
              <div className="mt-4 space-y-4 border-t border-gray-2 pt-4">
                <h4 className="text-white">Badges stats</h4>
                <p className="flex justify-between text-white">
                  <span className="text-gray-3">Lifetime</span>
                  {badgesCount}
                </p>
                <p className="flex justify-between text-white">
                  <span className="text-gray-3">Seasonal</span>
                  {seasonalBadgesCount}
                </p>
                <p className="flex justify-between text-white">
                  <span className="text-gray-3">Total</span>
                  {badgesCount + seasonalBadgesCount}
                </p>
                {/* Enable when official and mutual badges info is available */}
                {/* <p className="flex justify-between text-white">
                  <span className="text-gray-3">Official</span>
                  50
                </p> */}
                {/* <p className="flex justify-between text-white">
                  <span className="text-gray-3">Mutual</span>
                  411
                </p> */}
              </div>
            </div>
          </div>
          <div className="col-span-5"></div>
          <BadgeSection title="Lifetime Badges" badges={badges} />
          {orgAggregates.map((agg, index) => (
            <SeasonalBadgeSection agg={agg} seasonalBadges={seasonalBadges} key={index} />
          ))}
        </div>
      </Box>
      {/* Enable when message info is available */}
      {/* <Box>
        <h2 className="text-title-1 text-white">Messages</h2>
      </Box> */}
    </div>
  )
}
