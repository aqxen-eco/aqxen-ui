import { ReactNode } from 'react'

import { avatar, AvatarVariants } from '@/styles/avatar'

interface AvatarProps extends AvatarVariants {
  className?: string
  children: ReactNode
}

export function Avatar({ color, size, className, children }: AvatarProps) {
  return <div className={avatar({ size, color, class: className })}>{children}</div>
}
