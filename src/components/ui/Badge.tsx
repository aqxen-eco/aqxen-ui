import * as Avatar from '@radix-ui/react-avatar'
import { ComponentProps } from 'react'

import fallbackImg from '@/assets/badge_2.png'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useBadges } from '@/hooks/badges'
import { useSeasons } from '@/hooks/seasons'

interface BadgeProps extends ComponentProps<'div'> {
  symbol: string
  balance: string
  seasonal?: boolean
}

export function Badge({ symbol, balance, seasonal = false }: BadgeProps) {
  const { orgBadges } = useBadges()
  const { orgSeasonalBadges } = useSeasons()

  if (seasonal) {
    symbol =
      orgSeasonalBadges
        ?.find((orgSeasonalBadge) => orgSeasonalBadge.badge_agg_seq_id.toString() == symbol)
        ?.badge_symbol?.split(',', 2)[1] ?? ''
  }

  const badgeImage =
    IPFS_IMAGE_SOURCE +
    orgBadges
      ?.find((orgBadge) => orgBadge.badge_symbol.split(',', 2)[1] == symbol)
      ?.offchain_lookup_data.split('"', 4)[3]

  const badgeName = orgBadges
    ?.find((orgBadge) => orgBadge.badge_symbol.split(',', 2)[1] == symbol)
    ?.onchain_lookup_data.split('"', 4)[3]

  return (
    <Avatar.Root className="text-center">
      {/* TODO: Update this to parse badges lookup data */}
      <Avatar.Image className="mx-auto block h-32 w-32 rounded-full object-cover" src={badgeImage} />
      <Avatar.Fallback className="mx-auto block h-32 w-32 rounded-full object-cover">
        <img src={fallbackImg} />
      </Avatar.Fallback>
      <p className="mt-2 font-medium capitalize text-white">{badgeName}</p>
      {/* <p className="font-medium text-white">{symbol}</p> */}
      <p className="font-medium text-white">{balance}</p>
    </Avatar.Root>
  )
}
