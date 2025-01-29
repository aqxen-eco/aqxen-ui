'use client'

import { OTPInput, type OTPInputProps, REGEXP_ONLY_CHARS } from 'input-otp'
import { useId } from 'react'
import { MdErrorOutline } from 'react-icons/md'

type InputSymbolProps = {
  label?: string
  error?: string
  ref: React.Ref<HTMLInputElement> | undefined
} & Omit<OTPInputProps, 'children'>

export function InputSymbol({ label, error, ref, ...props }: InputSymbolProps) {
  const id = useId()

  return (
    <div className="group/input" data-error={!!error}>
      {label && (
        <label
          htmlFor={id}
          className="block cursor-pointer text-body-2 font-medium text-white group-data-[error=true]/input:text-red-600"
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-1">
        <OTPInput
          ref={ref}
          {...props}
          id={id}
          textAlign="center"
          inputMode="text"
          pattern={REGEXP_ONLY_CHARS}
          containerClassName="flex gap-2 items-center w-full"
          style={{ width: '100%' }}
          render={({ slots }) => (
            <>
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="relative h-12 w-8 border-b border-gray-3 pb-4 pt-2 text-center text-body-2 uppercase group-data-[error=true]/input:border-red-600"
                >
                  {slot.char !== null && slot.char}
                  {(slot.hasFakeCaret || slot.isActive) && (
                    <div className="rounded-ful absolute -bottom-px z-10 h-px w-full bg-white" />
                  )}
                </div>
              ))}
            </>
          )}
        />
        {error && <MdErrorOutline className="size-6 text-red-600" />}
      </div>
      {error && (
        <p className="mt-2 text-body-3 group-data-[error=true]/input:text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
