import { Slot } from '@radix-ui/react-slot'
import { twMerge } from 'tailwind-merge'

type BoxProps = {
  asChild?: boolean
} & React.ComponentProps<'div'>

export function Box({
  asChild,
  className,
  children,
  ref,
  ...restProps
}: BoxProps) {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={ref}
      className={twMerge(
        'border-gray-2 bg-gray-1 rounded-2xl border p-8',
        className
      )}
      {...restProps}
    >
      {children}
    </Comp>
  )
}
