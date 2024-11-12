import * as Popover from "@radix-ui/react-popover";
import { Command } from 'cmdk';
import { MdOutlineCheck, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { Button } from "@/components/ui/button";

type ComboboxProps = {
  title: string,
  children?: React.ReactNode
}

export function Combobox({ title, children }: ComboboxProps) {
  return (
    <Popover.Root>
      <div className="border-b border-gray-3 focus-within:border-white flex gap-1 items-center group-data-[error=true]/input:border-red-600">
        <Popover.Trigger className="flex gap-2 items-center justify-between text-body-2 text-gray-3 w-full text-left focus:outline-none">
          <span className="pt-2 pb-[calc(1rem-1px)]">{title}</span>
          <div className="p-2">
            <MdKeyboardArrowDown className="size-6" />
          </div>
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        <Popover.Content sideOffset={-47} alignOffset={-16} className="w-[var(--radix-popover-trigger-width)]">
          <Command>
            <div className="flex gap-2 items-center bg-gray-1 mobile:bg-black">
              <Command.Input 
                className="flex-1 w-full text-body-2 placeholder-gray-3 bg-transparent text-white pt-2 pb-[calc(1rem-1px)] focus:outline-0 focus:outline-none" 
                placeholder={title}
              />
              <Popover.Close asChild>
                <Button variant="link" size="md" square>
                  <MdKeyboardArrowUp className="size-6" />
                </Button>
              </Popover.Close>
            </div>
            <Command.List className="max-h-64 overflow-y-auto overflow-x-hidden p-4 mt-2 rounded-2xl border border-gray-2 bg-gray-1 [&_[cmdk-list-sizer]]:space-y-1">
              {children}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function ComboboxLoading() {
  return <Command.Loading className="text-body-2 text-center text-white py-4">Loading...</Command.Loading>
}

export function ComboboxEmpty() {
  return <Command.Empty className="text-body-2 text-center text-white py-4">No results found.</Command.Empty>
}

type ComboboxItemProps = {
  checked?: boolean
} & React.ComponentPropsWithoutRef<typeof Command.Item>

export function ComboboxItem({ checked, children, ...props }: ComboboxItemProps) {
  return (
    <Command.Item 
      {...props}
      className="flex items-center justify-between text-gray-3 aria-checked:text-white border border-transparent aria-checked:border-gray-2 select-none rounded p-[calc(0.5rem-1px)] text-body-2 outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-gray-2 data-[selected=true]:text-white data-[disabled=true]:opacity-50"
      aria-checked={checked}
    >
      {children}
      {checked && <MdOutlineCheck className="size-4" />}
    </Command.Item>
  )
}