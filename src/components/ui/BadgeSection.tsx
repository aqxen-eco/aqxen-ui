import { ComponentProps } from 'react'

import { Badge } from '@/components/ui/Badge'
import { BadgeType } from '@/models/badges'

interface BadgeSectionProps extends ComponentProps<'div'> {
  title: string
  badges: BadgeType[]
}

export function BadgeSection({ children, title, badges = [], ...restProps }: BadgeSectionProps) {
  return (
    <div className="p-8 mobile:px-4" {...restProps}>
      <h3 className="text-title-2 text-white">{title}</h3>
      <div className="my-4 flex items-center gap-4 overflow-x-auto">
        {badges?.map((badge, index) => (
          <Badge
            key={index}
            symbol={badge.balance.split(' ', 2)[1]}
            balance={badge.balance.split(' ', 1)[0]}
            className="flex-none"
          />
        ))}
      </div>
      {children}
    </div>
  )
}
