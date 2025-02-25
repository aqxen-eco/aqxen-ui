import { tv, type VariantProps } from 'tailwind-variants'

const tag = tv({
  base: 'inline-block rounded-full px-2 py-1 font-sans text-xs font-medium text-black uppercase',
  variants: {
    variant: {
      red: 'bg-badge-red',
      yellow: 'bg-badge-yellow',
      green: 'bg-badge-green',
      blue: 'bg-badge-blue',
      purple: 'bg-badge-purple',
      default: 'bg-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type TagProps = VariantProps<typeof tag> & React.ComponentProps<'span'>

export function Tag({ variant, className, children, ref, ...props }: TagProps) {
  return (
    <span ref={ref} className={tag({ variant, class: className })} {...props}>
      {children}
    </span>
  )
}
