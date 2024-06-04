import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

type FieldProps = ComponentProps<'div'>

export function Field({ className, children, ...restProps }: FieldProps) {
  return (
    <div
      {...restProps}
      className={twMerge('space-y-2 border-b border-gray-3 pb-4 focus-within:border-white', className)}
    >
      {children}
    </div>
  )
}
