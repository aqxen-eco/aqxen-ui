import { ComponentProps, ForwardedRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

type BoxProps = ComponentProps<'div'>

function BoxComponent({ className, children, ...restProps }: BoxProps, forwardedRef: ForwardedRef<HTMLDivElement>) {
  return (
    <div
      ref={forwardedRef}
      className={twMerge('rounded-2xl border border-gray-2 bg-gray-1 p-8', className)}
      {...restProps}
    >
      {children}
    </div>
  )
}

export const Box = forwardRef(BoxComponent)
