'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { tv, type VariantProps } from 'tailwind-variants'

export const avatar = tv({
  base: 'flex items-center justify-center overflow-hidden rounded-full border border-black/20 font-medium text-white uppercase',
  variants: {
    color: {
      red: 'bg-badge-red',
      yellow: 'bg-badge-yellow',
      green: 'bg-badge-green',
      blue: 'bg-badge-blue',
      purple: 'bg-badge-purple',
    },
    size: {
      xs: 'size-6 text-[0.625rem]',
      sm: 'text-body-2 size-10',
      md: 'text-body-2 size-12',
      lg: 'text-title-1 size-24 border-4',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'red',
  },
})

export type AvatarVariants = VariantProps<typeof avatar>

export type AvatarColor = AvatarVariants['color']

export function randomVariant() {
  const variants = Object.keys(avatar.variants.color)
  const randomIndex = Math.floor(Math.random() * variants.length)
  const variant = variants[randomIndex] as AvatarColor
  return variant
}

type AvatarProps = {
  className?: string
  children: React.ReactNode
  src?: string
} & AvatarVariants

export function Avatar({ color, size, className, children, src }: AvatarProps) {
  if (src) {
    return (
      <AvatarPrimitive.Root
        className={avatar({ size, color, class: className })}
      >
        <AvatarPrimitive.Image
          src={src}
          alt=""
          className="size-full object-cover"
        />
        <AvatarPrimitive.Fallback delayMs={300}>
          {children}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    )
  }

  return (
    <div className={avatar({ size, color, class: className })}>{children}</div>
  )
}
