'use client'

import * as Popover from '@radix-ui/react-popover'
import { format, parse, setHours, setMinutes } from 'date-fns'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { MdCalendarToday } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

type DateTimePickerProps = {
  value?: string
  onChange?: (value: string) => void
  id?: string
  hasError?: boolean
  placeholder?: string
}

export function DateTimePicker({
  value,
  onChange,
  id,
  hasError,
  placeholder = 'Select date and time',
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = value ? new Date(value) : undefined
  const timeValue = selected
    ? format(selected, 'HH:mm')
    : '12:00'

  function handleDaySelect(day: Date | undefined) {
    if (!day) return
    const [hours, minutes] = timeValue.split(':').map(Number)
    const combined = setMinutes(setHours(day, hours), minutes)
    onChange?.(format(combined, "yyyy-MM-dd'T'HH:mm"))
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const time = e.target.value
    if (!time) return
    const base = selected ?? new Date()
    const parsed = parse(time, 'HH:mm', base)
    onChange?.(format(parsed, "yyyy-MM-dd'T'HH:mm"))
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          className={twMerge(
            'border-gray-3 text-body-2 flex w-full items-center gap-2 border-b bg-transparent pt-2 pb-[calc(1rem-1px)] text-left text-white focus:border-white focus:outline-0',
            !selected && 'text-gray-3',
            hasError && 'border-red-500',
          )}
        >
          <MdCalendarToday className="size-5 shrink-0" />
          {selected ? format(selected, 'MMM d, yyyy h:mm a') : placeholder}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          className="border-gray-2 bg-gray-1 z-50 rounded-2xl border p-4 shadow-lg"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleDaySelect}
            classNames={{
              root: 'text-white',
              months: 'flex flex-col',
              month_caption: 'text-body-2 font-medium text-white flex justify-center py-1',
              nav: 'flex items-center justify-between absolute inset-x-0 top-0 px-1',
              button_previous: 'text-gray-3 hover:text-white p-1',
              button_next: 'text-gray-3 hover:text-white p-1',
              weekdays: 'flex',
              weekday: 'text-body-3 text-gray-3 w-9 text-center',
              week: 'flex',
              day: 'text-body-3 w-9 h-9 text-center',
              day_button: 'w-9 h-9 rounded-full hover:bg-gray-2 transition-colors cursor-pointer',
              selected: '!bg-white !text-black rounded-full',
              today: 'font-bold text-white',
              outside: 'text-gray-3/40',
              disabled: 'text-gray-3/40',
            }}
          />
          <div className="border-gray-2 mt-3 border-t pt-3">
            <label className="text-body-3 text-gray-3 mb-1 block">
              Time
            </label>
            <input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="border-gray-3 text-body-2 w-full rounded-lg border bg-transparent px-3 py-2 text-white focus:border-white focus:outline-0"
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
