import { ComponentProps, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Box } from '@/components/ui/Box'
import { DropdownItem, DropdownRoot } from '@/components/ui/Dropdown'
import { useSeasons } from '@/hooks/seasons'
import { AchievementType, OrgAggregateType } from '@/models/seasons'

interface SeasonalBadgeSectionProps extends ComponentProps<'div'> {
  agg: OrgAggregateType
  seasonalBadges: AchievementType[]
}

export function SeasonalBadgeSection({ children, agg, seasonalBadges = [], ...restProps }: SeasonalBadgeSectionProps) {
  const [selectedSequence, setSelectedSequence] = useState(agg?.agg_sequences?.[agg?.agg_sequences?.length - 1])

  const { orgSeasonalBadges } = useSeasons()

  const sequenceBadges = seasonalBadges.filter((badge) => {
    const sequence = orgSeasonalBadges?.find(
      (orgSeasonalBadge) => orgSeasonalBadge.badge_agg_seq_id == badge.badge_agg_seq_id
    )
    if (sequence?.seq_id == selectedSequence?.seq_id) {
      return badge
    }
  })

  return (
    <div className="p-8 mobile:px-4" {...restProps}>
      <div className="flex items-center justify-between gap-4 align-middle">
        <h3 className="text-title-2 text-white">{agg?.agg_description}</h3>
        <DropdownRoot label={selectedSequence?.sequence_description ?? 'Sequence'} align="end">
          {agg?.agg_sequences?.map((seq, index) => (
            <DropdownItem
              key={index}
              isSelected={selectedSequence?.seq_id == seq.seq_id}
              onClick={() => setSelectedSequence(seq)}
            >
              {seq.sequence_description}
            </DropdownItem>
          ))}
        </DropdownRoot>
      </div>
      <div className="my-4 flex items-center gap-4 overflow-x-auto">
        {sequenceBadges.length > 0 ? (
          <>
            {sequenceBadges.map((badge, index) => (
              <div className="flex-none" key={index}>
                <Badge symbol={badge.badge_agg_seq_id.toString()} balance={badge.count.toString()} seasonal />
              </div>
            ))}
          </>
        ) : (
          <Box className="flex h-[12.5rem] w-full items-center justify-center text-center">
            <p className="text-body-2 text-gray-3">No Badges received yet</p>
          </Box>
        )}
      </div>
      {children}
    </div>
  )
}
