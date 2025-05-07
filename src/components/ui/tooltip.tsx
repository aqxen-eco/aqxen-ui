'use client'

import {
  Arrow,
  Content,
  Portal,
  Provider,
  Root,
  Trigger,
} from '@radix-ui/react-tooltip'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

type TooltipProps = {
  content: React.ReactNode
  arrowFill?: string
  className?: string
  children: React.ReactNode
}

export function Tooltip({
  content,
  arrowFill,
  children,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <Provider>
      <Root open={open} delayDuration={0} onOpenChange={setOpen}>
        <Trigger onClick={() => setOpen(true)} asChild>
          {children}
        </Trigger>
        <Portal>
          <Content
            className={twMerge(
              'border-gray-2 bg-gray-1 text-body-3 z-10 max-w-64 rounded-lg border p-3 select-none',
              className
            )}
            sideOffset={5}
          >
            {content}
            <Arrow className="fill-gray-2" style={{ fill: arrowFill }} />
          </Content>
        </Portal>
      </Root>
    </Provider>
  )
}
