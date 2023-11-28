import { tv, type VariantProps } from 'tailwind-variants'

export const button = tv({
  base: 'body-2 inline-flex cursor-pointer gap-1 rounded-full border font-sans font-medium duration-150 disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    variant: {
      primary: 'border-white bg-white text-black desktop:hover:border-gray-3 desktop:hover:bg-gray-3',
      secondary: 'border-gray-2 bg-gray-1 text-white desktop:hover:bg-gray-2',
      link: 'border-transparent bg-transparent text-white desktop:hover:underline',
      default: 'border-transparent bg-transparent text-gray-3 desktop:hover:underline'
    },
    size: {
      md: 'px-[calc(1rem-1px)] py-[calc(0.5rem-1px)]',
      lg: 'px-[calc(2rem-1px)] py-[calc(1rem-1px)]'
    },
    square: {
      true: ''
    }
  },
  compoundVariants: [
    {
      size: 'lg',
      class: 'gap-2'
    },
    {
      size: 'md',
      square: true,
      class: 'px-[calc(0.5rem-1px)]'
    },
    {
      size: 'lg',
      square: true,
      class: 'px-[calc(1rem-1px)]'
    }
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default'
  }
})

export type ButtonVariants = VariantProps<typeof button>
