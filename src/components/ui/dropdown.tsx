"use client";

import {
  Content,
  type DropdownMenuItemProps,
  Item,
  Portal,
  Root,
  Trigger,
} from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

import { Button } from "@/components/ui/button";

type DropdownRootProps = {
  label?: string;
  align?: "start" | "center" | "end";
  customTrigger?: React.ReactNode;
  children: React.ReactNode;
};

export function DropdownRoot({
  label,
  customTrigger,
  align,
  children,
}: DropdownRootProps) {
  const [open, setOpen] = useState(false);

  return (
    <Root open={open} onOpenChange={setOpen}>
      {customTrigger && <Trigger asChild>{customTrigger}</Trigger>}
      {label && (
        <Trigger asChild>
          <Button
            variant="secondary"
            size="md"
            className="group/dropdown-button inline-flex items-center"
          >
            {label}
            <MdKeyboardArrowDown className="h-6 w-6 duration-150 group-data-[state=open]/dropdown-button:rotate-180" />
          </Button>
        </Trigger>
      )}
      <AnimatePresence>
        {open && (
          <Portal forceMount>
            <Content
              forceMount
              align={align}
              className="z-40 mt-1 max-h-72 w-64 space-y-2 overflow-y-auto rounded-2xl border border-gray-2 bg-gray-1 px-2 py-4"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
              >
                {children}
              </motion.div>
            </Content>
          </Portal>
        )}
      </AnimatePresence>
    </Root>
  );
}

type DropdownItemProps = {
  isSelected?: boolean;
  children: React.ReactNode;
} & DropdownMenuItemProps;

export function DropdownItem({
  isSelected,
  children,
  ...props
}: DropdownItemProps) {
  return (
    <Item
      data-state={isSelected && "selected"}
      className="block cursor-pointer rounded-full px-4 py-2 text-body-2 font-medium text-gray-3 focus:bg-gray-2 focus:outline-none data-[state=selected]:bg-gray-2 data-[state=selected]:text-white desktop:hover:bg-gray-2"
      {...props}
    >
      {children}
    </Item>
  );
}
