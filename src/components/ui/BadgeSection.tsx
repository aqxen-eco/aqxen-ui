import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { BadgeSectionLoading } from '@/components/ui/BadgeSectionLoading'
import { BadgeSwiper, BadgeSwiperSlide, BadgeSwiperWrapper } from '@/components/ui/BadgeSwiper'
import { useBadges } from '@/hooks/badges'
import { BadgeFilterType, BadgeType } from '@/models/badges'

export function BadgeSection() {
  const [isLoading, setIsLoading] = useState(true)
  const [badges, setBadges] = useState([] as BadgeType[])

  const { userBadges } = useBadges()
  const { user } = useParams()

  useEffect(() => {
    async function getBadges() {
      const responseBadges = await userBadges({
        scope: user,
        queryType: BadgeFilterType.DEFAULT,
        lowerBound: '',
        upperBound: ''
      })

      if (responseBadges?.rows?.length) {
        setBadges(responseBadges.rows)
      }

      setIsLoading(false)
    }

    let intervalId: NodeJS.Timeout
    if (user) {
      getBadges()
      intervalId = setInterval(getBadges, 60000)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [user, userBadges])

  const badgesCount = badges.reduce((sum, badge) => parseInt(badge.balance.split(' ', 1)[0]) + sum, 0) ?? 0

  if (isLoading) {
    return <BadgeSectionLoading />
  }

  return (
    <section className="py-8">
      <header className="mb-4 px-8 mobile:px-4">
        <h3 className="text-title-2 text-white">
          Lifetime Badges <span className="text-gray-3">({badgesCount})</span>
        </h3>
      </header>
      <BadgeSwiper>
        <BadgeSwiperWrapper>
          {badges?.map((badge, index) => (
            <BadgeSwiperSlide key={index}>
              <Badge symbol={badge.balance.split(' ', 2)[1]} balance={badge.balance.split(' ', 1)[0]} />
            </BadgeSwiperSlide>
          ))}
        </BadgeSwiperWrapper>
      </BadgeSwiper>
    </section>
  )
}
