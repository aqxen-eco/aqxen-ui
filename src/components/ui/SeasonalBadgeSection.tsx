import { ComponentProps, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { DropdownItem, DropdownRoot } from '@/components/ui/Dropdown'
import { useSeasons } from '@/hooks/seasons'
import { AchievementType, OrgAggregateType } from '@/models/seasons'

interface SeasonalBadgeSectionProps extends ComponentProps<'div'> {
  agg: OrgAggregateType
  seasonalBadges: AchievementType[]
}

export function SeasonalBadgeSection({ children, agg, seasonalBadges = [], ...restProps }: SeasonalBadgeSectionProps) {
  const [selectedSequence, setSelectedSequence] = useState(agg?.agg_sequences?.[0])

  const { orgSeasonalBadges } = useSeasons()

  return (
    <div className="p-8 mobile:px-4" {...restProps}>
      <div className="flex items-center justify-between truncate align-middle">
        <h3 className="truncate text-title-2 text-white">{agg?.agg_description}</h3>
        <DropdownRoot label={selectedSequence?.sequence_description ?? 'Sequence'}>
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
        {seasonalBadges?.map(
          (badge, index) =>
            orgSeasonalBadges?.find((orgSeasonalBadge) => orgSeasonalBadge.badge_agg_seq_id == badge.badge_agg_seq_id)
              ?.seq_id == selectedSequence?.seq_id && (
              <Badge
                key={index}
                symbol={badge.badge_agg_seq_id.toString()}
                balance={badge.count.toString()}
                seasonal
                className="flex-none"
              />
            )
        )}
      </div>
      {children}
    </div>
  )
}
