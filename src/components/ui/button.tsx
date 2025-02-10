import { Slot } from '@radix-ui/react-slot'
import { tv, type VariantProps } from 'tailwind-variants'

export const button = tv({
  base: 'text-body-2 focus:border-gray-3 inline-flex cursor-pointer gap-1 rounded-full border font-sans font-medium text-nowrap duration-150 select-none focus:outline-0 disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    variant: {
      primary:
        'hover:border-gray-3 hover:bg-gray-3 border-white bg-white text-black',
      secondary: 'border-gray-2 bg-gray-1 hover:bg-gray-2 text-white',
      link: 'border-transparent bg-transparent text-white hover:underline',
      default: 'text-gray-3 border-transparent bg-transparent hover:underline',
    },
    size: {
      md: 'px-[calc(1rem-1px)] py-[calc(0.5rem-1px)]',
      lg: 'px-[calc(2rem-1px)] py-[calc(1rem-1px)]',
    },
    square: {
      true: '',
    },
  },
  compoundVariants: [
    {
      size: 'lg',
      class: 'gap-2',
    },
    {
      size: 'md',
      square: true,
      class: 'px-[calc(0.5rem-1px)]',
    },
    {
      size: 'lg',
      square: true,
      class: 'px-[calc(1rem-1px)]',
    },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

export type ButtonVariants = VariantProps<typeof button>

type ButtonProps = {
  asChild?: boolean
} & ButtonVariants &
  React.ComponentProps<'button'>

export function Button({
  size,
  variant,
  square,
  className,
  asChild = false,
  children,
  ref,
  ...restProps
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      type="button"
      className={button({ size, variant, square, class: className })}
      {...restProps}
    >
      {children}
    </Comp>
  )
}
