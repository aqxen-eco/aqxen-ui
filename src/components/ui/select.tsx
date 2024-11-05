import { type ButtonVariants, button } from "@/components/ui/button";
import * as PrimitiveSelect from "@radix-ui/react-select";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineCheck,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";

type SelectProps = {
  label: string;
} & ButtonVariants &
  PrimitiveSelect.SelectProps &
  PrimitiveSelect.SelectValueProps;

export function Select({
  label,
  size,
  variant = "secondary",
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
          class: twMerge("justify-between", className),
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
          className="overflow-hidden rounded-md bg-gray-1 border border-gray-2 w-[var(--radix-select-trigger-width)]"
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
          <PrimitiveSelect.ScrollDownButton className="flex h-[25px] cursor-default items-center justify-center bg-white text-violet11">
            <MdKeyboardArrowDown className="size-6" />
          </PrimitiveSelect.ScrollDownButton>
        </PrimitiveSelect.Content>
      </PrimitiveSelect.Portal>
    </PrimitiveSelect.Root>
  );
}

export function SelectItem({
  children,
  ...props
}: PrimitiveSelect.SelectItemProps) {
  return (
    <PrimitiveSelect.Item
      {...props}
      className="flex gap-1 items-center justify-between px-[calc(1rem-1px)] py-[calc(0.5rem-1px)] outline-none desktop:hover:bg-gray-2 focus:bg-gray-2"
    >
      <PrimitiveSelect.ItemText>{children}</PrimitiveSelect.ItemText>
      <div className="size-6 flex justify-center items-center">
        <PrimitiveSelect.ItemIndicator asChild>
          <MdOutlineCheck className="size-4" />
        </PrimitiveSelect.ItemIndicator>
      </div>
    </PrimitiveSelect.Item>
  );
}
