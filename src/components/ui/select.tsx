import * as PrimitiveSelect from '@radix-ui/react-select'
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineCheck,
} from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

import { button, type ButtonVariants } from '@/components/ui/button'

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
          className="border-gray-2 bg-gray-1 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border"
        >
          <PrimitiveSelect.ScrollUpButton className="cursor-default items-center justify-center">
            <MdKeyboardArrowUp className="size-6" />
          </PrimitiveSelect.ScrollUpButton>
          <PrimitiveSelect.Viewport>
            <PrimitiveSelect.Group>
              <PrimitiveSelect.Label className="text-body-3 text-gray-3 px-[calc(1rem-1px)] py-[calc(0.5rem-1px)]">
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
      className="focus:bg-gray-2 hover:bg-gray-2 flex items-center justify-between gap-1 px-[calc(1rem-1px)] py-[calc(0.5rem-1px)] outline-hidden"
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
