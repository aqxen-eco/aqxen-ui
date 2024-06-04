import { ComponentProps, ForwardedRef, forwardRef } from 'react'

import { input } from '@/styles/input'

type InputProps = ComponentProps<'input'>

function InputComponent({ className, ...restProps }: InputProps, forwardedRef: ForwardedRef<HTMLInputElement>) {
  return <input ref={forwardedRef} type="text" className={input({ class: className })} {...restProps} />
}

export const Input = forwardRef(InputComponent)
