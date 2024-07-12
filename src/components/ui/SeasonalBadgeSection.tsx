import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { BadgeSectionLoading } from '@/components/ui/BadgeSectionLoading'
import { BadgeSwiper, BadgeSwiperSlide, BadgeSwiperWrapper } from '@/components/ui/BadgeSwiper'
import { Box } from '@/components/ui/Box'
import { DropdownItem, DropdownRoot } from '@/components/ui/Dropdown'
import { useSeasons } from '@/hooks/seasons'
import { BadgeFilterType } from '@/models/badges'
import { AchievementType, OrgAggregateType } from '@/models/seasons'

interface SeasonalBadgeSectionProps {
  agg: OrgAggregateType
}

export function SeasonalBadgeSection({ agg }: SeasonalBadgeSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSequence, setSelectedSequence] = useState(agg?.agg_sequences?.[agg?.agg_sequences?.length - 1])
  const [sequenceBadges, setSequenceBadges] = useState([] as AchievementType[])

  const { orgSeasonalBadges, userSeasonalBadges } = useSeasons()
  const { user } = useParams()

  useEffect(() => {
    async function getSeasonalBadges() {
      const responseSeasonal = await userSeasonalBadges({
        scope: user,
        queryType: BadgeFilterType.DEFAULT,
        lowerBound: '',
        upperBound: ''
      })

      if (responseSeasonal?.rows?.length) {
        const sequenceBadges = responseSeasonal?.rows?.filter((badge) => {
          const sequence = orgSeasonalBadges?.find(
            (orgSeasonalBadge) => orgSeasonalBadge.badge_agg_seq_id == badge.badge_agg_seq_id
          )
          if (sequence?.seq_id == selectedSequence?.seq_id) {
            return badge
          }
        })

        setSequenceBadges(sequenceBadges)
      }

      setIsLoading(false)
    }

    let intervalId: NodeJS.Timeout
    if (user) {
      getSeasonalBadges()
      intervalId = setInterval(getSeasonalBadges, 60000)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [user, userSeasonalBadges, selectedSequence, orgSeasonalBadges])

  if (isLoading) {
    return <BadgeSectionLoading />
  }

  return (
    <section className="py-8">
      <header className="mb-4 flex items-center justify-between gap-4 px-8 mobile:px-4">
        <h3 className="text-title-2 text-white">
          {agg?.agg_description} <span className="text-gray-3">({sequenceBadges.length})</span>
        </h3>
        <DropdownRoot label={selectedSequence?.sequence_description ?? 'Sequence'} align="end">
          {agg?.agg_sequences?.map((seq, index) => (
            <DropdownItem
              key={index}
              isSelected={selectedSequence?.seq_id == seq.seq_id}
              onClick={() => {
                setIsLoading(true)
                setSelectedSequence(seq)
              }}
            >
              {seq.sequence_description}
            </DropdownItem>
          ))}
        </DropdownRoot>
      </header>
      {sequenceBadges.length > 0 ? (
        <BadgeSwiper>
          <BadgeSwiperWrapper>
            {sequenceBadges.map((badge, index) => (
              <BadgeSwiperSlide key={index}>
                <Badge symbol={badge.badge_agg_seq_id.toString()} balance={badge.count.toString()} seasonal />
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
