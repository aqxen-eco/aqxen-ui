import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

type LabelProps = ComponentProps<'label'>

export function Label({ className, children, ...restProps }: LabelProps) {
  return (
    <label {...restProps} className={twMerge('block text-title-2 text-white', className)}>
      {children}
    </label>
  )
}
