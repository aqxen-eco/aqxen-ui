import { ComponentProps, ForwardedRef, forwardRef } from 'react'

import { input } from '@/styles/input'

type TextAreaProps = ComponentProps<'textarea'>

function TextAreaComponent(
  { className, ...restProps }: TextAreaProps,
  forwardedRef: ForwardedRef<HTMLTextAreaElement>
) {
  return <textarea ref={forwardedRef} className={input({ class: className })} {...restProps} />
}

export const TextArea = forwardRef(TextAreaComponent)
