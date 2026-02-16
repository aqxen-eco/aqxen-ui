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
  triggerContent?: React.ReactNode
  children?: React.ReactNode
} & React.ComponentPropsWithoutRef<typeof Command>

export function Combobox({
  title,
  triggerContent,
  children,
  ...props
}: ComboboxProps) {
  return (
    <Popover.Root>
      <div className="border-gray-3 flex items-center gap-1 border-b group-data-[error=true]/input:border-red-600 focus-within:border-white">
        <Popover.Trigger className="text-body-2 text-gray-3 flex w-full items-center justify-between gap-2 text-left focus:outline-hidden">
          <div className="flex min-h-10 flex-1 flex-wrap items-center gap-2 py-1">
            {triggerContent || (
              <span className="text-gray-3">{title}</span>
            )}
          </div>
          <div className="shrink-0 p-2">
            <MdKeyboardArrowDown className="size-6" />
          </div>
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        <Popover.Content
          sideOffset={-47}
          alignOffset={-16}
          className="z-70 w-[var(--radix-popover-trigger-width)]"
        >
          <Command {...props}>
            <div className="bg-gray-1 flex items-center gap-2 max-md:bg-black">
              <Command.Input
                className="text-body-2 placeholder-gray-3 w-full flex-1 bg-transparent pt-2 pb-[calc(1rem-1px)] text-white focus:outline-hidden focus:outline-0"
                placeholder={title}
              />
              <Popover.Close asChild>
                <Button variant="link" size="md" square>
                  <MdKeyboardArrowUp className="size-6" />
                </Button>
              </Popover.Close>
            </div>
            <Command.List className="border-gray-2 bg-gray-1 mt-2 max-h-64 overflow-x-hidden overflow-y-auto rounded-2xl border p-4 [&_[cmdk-list-sizer]]:space-y-1">
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
    <Command.Loading className="text-body-2 py-4 text-center text-white">
      Loading...
    </Command.Loading>
  )
}

export function ComboboxEmpty() {
  return (
    <Command.Empty className="text-body-2 py-4 text-center text-white">
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
      className="text-body-2 text-gray-3 aria-checked:border-gray-2 data-[selected=true]:bg-gray-2 flex items-center justify-between rounded-sm border border-transparent p-[calc(0.5rem-1px)] outline-hidden select-none aria-checked:text-white data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:text-white"
      aria-checked={checked}
    >
      {children}
      {checked && <MdOutlineCheck className="size-4" />}
    </Command.Item>
  )
}
