import { tv, type VariantProps } from 'tailwind-variants'

export const avatar = tv({
  base: 'flex items-center justify-center rounded-full border border-black/20 font-medium text-white uppercase',
  variants: {
    color: {
      red: 'bg-badge-red',
      yellow: 'bg-badge-yellow',
      green: 'bg-badge-green',
      blue: 'bg-badge-blue',
      purple: 'bg-badge-purple',
    },
    size: {
      sm: 'h-6 w-6 text-[0.625rem]',
      md: 'text-body-2 h-10 w-10',
      lg: 'text-title-1 h-24 w-24 border-4',
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
} & AvatarVariants

export function Avatar({ color, size, className, children }: AvatarProps) {
  return (
    <div className={avatar({ size, color, class: className })}>{children}</div>
  )
}
