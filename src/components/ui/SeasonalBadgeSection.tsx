import { ComponentProps } from 'react'

import { Badge } from '@/components/ui/Badge'
import { DropdownItem, DropdownRoot } from '@/components/ui/Dropdown'
import { AchievementType } from '@/models/seasons'

interface SeasonalBadgeSectionProps extends ComponentProps<'div'> {
  title: string
  seasonalBadges: AchievementType[]
}

export function SeasonalBadgeSection({
  children,
  title,
  seasonalBadges = [],
  ...restProps
}: SeasonalBadgeSectionProps) {
  return (
    <div className="col-span-8 border-t border-gray-2 p-8" {...restProps}>
      <div className="flex justify-between align-middle">
        <h3 className="text-title-2 text-white">{title}</h3>
        <DropdownRoot label="Sequence">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((item) => (
            <DropdownItem key={item} isSelected={item === 1} onClick={() => console.log(`click item ${item}`)}>
              Item {item}
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
