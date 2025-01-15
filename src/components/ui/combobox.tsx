import * as Popover from '@radix-ui/react-popover'
import { Command } from 'cmdk'
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineCheck,
} from 'react-icons/md'

import { Button } from '@/components/ui/button'

type ComboboxProps = {
  title: string
  children?: React.ReactNode
} & React.ComponentPropsWithoutRef<typeof Command>

export function Combobox({ title, children, ...props }: ComboboxProps) {
  return (
    <Popover.Root>
      <div className="flex items-center gap-1 border-b border-gray-3 focus-within:border-white group-data-[error=true]/input:border-red-600">
        <Popover.Trigger className="flex w-full items-center justify-between gap-2 text-left text-body-2 text-gray-3 focus:outline-none">
          <span className="pb-[calc(1rem-1px)] pt-2">{title}</span>
          <div className="p-2">
            <MdKeyboardArrowDown className="size-6" />
          </div>
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        <Popover.Content
          sideOffset={-47}
          alignOffset={-16}
          className="w-[var(--radix-popover-trigger-width)]"
        >
          <Command {...props}>
            <div className="flex items-center gap-2 bg-gray-1 mobile:bg-black">
              <Command.Input
                className="w-full flex-1 bg-transparent pb-[calc(1rem-1px)] pt-2 text-body-2 text-white placeholder-gray-3 focus:outline-none focus:outline-0"
                placeholder={title}
              />
              <Popover.Close asChild>
                <Button variant="link" size="md" square>
                  <MdKeyboardArrowUp className="size-6" />
                </Button>
              </Popover.Close>
            </div>
            <Command.List className="mt-2 max-h-64 overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-2 bg-gray-1 p-4 [&_[cmdk-list-sizer]]:space-y-1">
              {children}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function ComboboxLoading() {
  return (
    <Command.Loading className="py-4 text-center text-body-2 text-white">
      Loading...
    </Command.Loading>
  )
}

export function ComboboxEmpty() {
  return (
    <Command.Empty className="py-4 text-center text-body-2 text-white">
      No results found.
    </Command.Empty>
  )
}

type ComboboxItemProps = {
  checked?: boolean
} & React.ComponentPropsWithoutRef<typeof Command.Item>

export function ComboboxItem({
  checked,
  children,
  ...props
}: ComboboxItemProps) {
  return (
    <Command.Item
      {...props}
      className="flex select-none items-center justify-between rounded border border-transparent p-[calc(0.5rem-1px)] text-body-2 text-gray-3 outline-none aria-checked:border-gray-2 aria-checked:text-white data-[disabled=true]:pointer-events-none data-[selected=true]:bg-gray-2 data-[selected=true]:text-white data-[disabled=true]:opacity-50"
      aria-checked={checked}
    >
      {children}
      {checked && <MdOutlineCheck className="size-4" />}
    </Command.Item>
  )
}
