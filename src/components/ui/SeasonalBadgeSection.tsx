import { ComponentProps, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { DropdownItem, DropdownRoot } from '@/components/ui/Dropdown'
import { AchievementType, OrgAggregateType } from '@/models/seasons'

interface SeasonalBadgeSectionProps extends ComponentProps<'div'> {
  agg: OrgAggregateType
  seasonalBadges: AchievementType[]
}

export function SeasonalBadgeSection({ children, agg, seasonalBadges = [], ...restProps }: SeasonalBadgeSectionProps) {
  const [selectedSequence, setSelectedSequence] = useState(agg?.agg_sequences?.[0])

  return (
    <div className="col-span-8 border-t border-gray-2 p-8" {...restProps}>
      <div className="flex justify-between align-middle">
        <h3 className="text-title-2 text-white">{agg?.agg_description}</h3>
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
      <div className="my-4 flex items-center justify-center gap-4 align-middle">
        {seasonalBadges?.map((badge, index) => (
          <Badge key={index} symbol={badge.badge_agg_seq_id.toString()} balance={badge.count.toString()} seasonal />
        ))}
      </div>
      {children}
    </div>
  )
}
