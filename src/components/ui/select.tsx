import * as PrimitiveSelect from '@radix-ui/react-select'
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineCheck,
} from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

import { button,type ButtonVariants } from '@/components/ui/button'

type SelectProps = {
  label: string
} & ButtonVariants &
  PrimitiveSelect.SelectProps &
  PrimitiveSelect.SelectValueProps

export function Select({
  label,
  size,
  variant = 'secondary',
  placeholder,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <PrimitiveSelect.Root {...props}>
      <PrimitiveSelect.Trigger
        className={button({
          size,
          variant,
          class: twMerge('justify-between', className),
        })}
        aria-label={label}
      >
        <PrimitiveSelect.Value placeholder={placeholder} />
        <PrimitiveSelect.Icon>
          <MdKeyboardArrowDown className="size-6" />
        </PrimitiveSelect.Icon>
      </PrimitiveSelect.Trigger>
      <PrimitiveSelect.Portal>
        <PrimitiveSelect.Content
          position="popper"
          sideOffset={8}
          className="w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-gray-2 bg-gray-1"
        >
          <PrimitiveSelect.ScrollUpButton className="cursor-default items-center justify-center">
            <MdKeyboardArrowUp className="size-6" />
          </PrimitiveSelect.ScrollUpButton>
          <PrimitiveSelect.Viewport>
            <PrimitiveSelect.Group>
              <PrimitiveSelect.Label className="px-[calc(1rem-1px)] py-[calc(0.5rem-1px)] text-body-3 text-gray-3">
                {label}
              </PrimitiveSelect.Label>
              {children}
            </PrimitiveSelect.Group>
          </PrimitiveSelect.Viewport>
          <PrimitiveSelect.ScrollDownButton className="text-violet11 flex h-[25px] cursor-default items-center justify-center bg-white">
            <MdKeyboardArrowDown className="size-6" />
          </PrimitiveSelect.ScrollDownButton>
        </PrimitiveSelect.Content>
      </PrimitiveSelect.Portal>
    </PrimitiveSelect.Root>
  )
}

export function SelectItem({
  children,
  ...props
}: PrimitiveSelect.SelectItemProps) {
  return (
    <PrimitiveSelect.Item
      {...props}
      className="flex items-center justify-between gap-1 px-[calc(1rem-1px)] py-[calc(0.5rem-1px)] outline-none focus:bg-gray-2 desktop:hover:bg-gray-2"
    >
      <PrimitiveSelect.ItemText>{children}</PrimitiveSelect.ItemText>
      <div className="flex size-6 items-center justify-center">
        <PrimitiveSelect.ItemIndicator asChild>
          <MdOutlineCheck className="size-4" />
        </PrimitiveSelect.ItemIndicator>
      </div>
    </PrimitiveSelect.Item>
  )
}
