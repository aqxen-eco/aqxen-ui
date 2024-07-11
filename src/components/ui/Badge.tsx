import { ComponentProps } from 'react'

import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useBadges } from '@/hooks/badges'
import { useSeasons } from '@/hooks/seasons'

interface BadgeProps extends ComponentProps<'div'> {
  symbol: string
  balance: string
  seasonal?: boolean
}

export function Badge({ children, symbol, balance, seasonal = false, ...restProps }: BadgeProps) {
  const { orgBadges } = useBadges()
  const { orgSeasonalBadges } = useSeasons()

  if (seasonal) {
    symbol =
      orgSeasonalBadges
        ?.find((orgSeasonalBadge) => orgSeasonalBadge.badge_agg_seq_id.toString() == symbol)
        ?.badge_symbol?.split(',', 2)[1] ?? ''
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-2" {...restProps}>
      {/* TODO: Update this to parse badges lookup data */}
      <img
        className="h-32 w-32 rounded-full object-cover"
        src={
          IPFS_IMAGE_SOURCE +
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
