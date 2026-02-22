import { Avatar } from '@/components/ui/avatar'
import { BadgeImage } from '@/components/ui/badge-image'

type BadgeProps = {
  ipfs?: string
  name: string
  balance: string
  orgOverlaySrc?: string
  orgOverlayInitials?: string
}

export function Badge({
  ipfs,
  name,
  balance,
  orgOverlaySrc,
  orgOverlayInitials,
}: BadgeProps) {
  return (
    <div className="text-center">
      <div className="relative mx-auto w-fit">
        <BadgeImage src={ipfs} className="mx-auto" />
        {(orgOverlaySrc || orgOverlayInitials) && (
          <div className="absolute -right-1 -bottom-1">
            <Avatar size="xs" color="blue" src={orgOverlaySrc}>
              {orgOverlayInitials ?? ''}
            </Avatar>
          </div>
        )}
      </div>
      <p className="text-body-2 mt-2 font-medium text-white">{name}</p>
      <p className="text-body-2 text-gray-3">
        {balance} badge{Number(balance) === 1 ? '' : 's'}
      </p>
    </div>
  )
}
