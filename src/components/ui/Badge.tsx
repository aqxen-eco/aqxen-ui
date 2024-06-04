import { ComponentProps } from 'react'

import { OrgBadgeType } from '@/models/badges'

interface BadgeProps extends ComponentProps<'div'> {
  symbol: string
  balance: string
  orgBadges: OrgBadgeType[]
}

const imgSrc = 'https://facings.mypinata.cloud/ipfs/'

export function Badge({ children, symbol, balance, orgBadges, ...restProps }: BadgeProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2" {...restProps}>
      {/* TODO: Update this to parse badges lookup data */}
      <img
        className="h-32 w-32 rounded-full object-cover"
        src={
          imgSrc +
            orgBadges
              ?.find((orgBadge) => orgBadge.badge_symbol.split(',', 2)[1] == symbol)
              ?.offchain_lookup_data.split('"', 4)[3] ?? './src/assets/badge_0.png'
        }
      />
      <div className="flex flex-col items-center">
        <p className="font-medium text-white">
          {
            orgBadges
              ?.find((orgBadge) => orgBadge.badge_symbol.split(',', 2)[1] == symbol)
              ?.onchain_lookup_data.split('"', 4)[3]
          }
        </p>
        <p className="font-medium text-white">{symbol}</p>
        <p className="font-medium text-white">{balance}</p>
      </div>
      {children}
    </div>
  )
}
