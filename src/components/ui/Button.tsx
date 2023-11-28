import { ComponentProps, ForwardedRef, forwardRef } from 'react'

import { button, ButtonVariants } from '@/styles/button'

interface ButtonProps extends ButtonVariants, ComponentProps<'button'> {}

function ButtonComponent(
  { size, variant, square, className, children, ...restProps }: ButtonProps,
  forwardedRef: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      ref={forwardedRef}
      type="button"
      className={button({ size, variant, square, class: className })}
      {...restProps}
    >
      {children}
    </button>
  )
}

export const Button = forwardRef(ButtonComponent)
