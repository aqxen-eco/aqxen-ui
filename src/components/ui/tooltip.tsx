"use client";

import {
  Arrow,
  Content,
  Portal,
  Provider,
  Root,
  Trigger,
} from "@radix-ui/react-tooltip";
import { useState } from "react";

type TooltipProps = {
  content: string;
  arrowFill?: string;
  children: React.ReactNode;
} & React.ComponentProps<"div">;

export function Tooltip({
  content,
  arrowFill,
  children,
  ...restProps
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Provider>
      <Root open={open} delayDuration={0} onOpenChange={setOpen}>
        <Trigger onClick={() => setOpen(true)} asChild>
          {children}
        </Trigger>
        <Portal>
          <Content
            className="max-w-64 select-none rounded-lg border border-gray-2 bg-gray-1 p-3 text-body-3"
            sideOffset={5}
            {...restProps}
          >
            {content}
            <Arrow className="fill-gray-2" style={{ fill: arrowFill }} />
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
}
