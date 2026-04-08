import { Avatar } from '@/components/ui/avatar'
import { BadgeImage } from '@/components/ui/badge-image'

type BadgeProps = {
  ipfs?: string
  name: string
  balance: string
  orgOverlaySrc?: string
  orgOverlayInitials?: string
  label?: string
  balanceLabel?: string
  badgeSymbol?: string
  size?: 'lg' | 'md'
}

export function Badge({
  ipfs,
  name,
  balance,
  orgOverlaySrc,
  orgOverlayInitials,
  label = 'badge',
  balanceLabel,
  badgeSymbol,
  size = 'lg',
}: BadgeProps) {
  return (
    <div className="text-center">
      <div className="relative mx-auto w-fit">
        <BadgeImage src={ipfs} size={size} className="mx-auto" badgeSymbol={badgeSymbol} displayName={name} />
        {(orgOverlaySrc || orgOverlayInitials) && (
          <div className="absolute -right-1 -bottom-1">
            <Avatar size="sm" color="blue" src={orgOverlaySrc}>
              {orgOverlayInitials ?? ''}
            </Avatar>
          </div>
        )}
      </div>
      <p className="text-body-2 mt-2 font-medium text-white">{name}</p>
      <p className="text-body-2 text-gray-3">
        {balanceLabel
          ? `${balance} ${balanceLabel}`
          : `${balance} ${label}${Number(balance) === 1 ? '' : 's'}`}
      </p>
    </div>
  )
}
