'use client'

import { OTPInput, type OTPInputProps, REGEXP_ONLY_CHARS } from 'input-otp'

type InputSymbolProps = {
  ref: React.Ref<HTMLInputElement> | undefined
} & Omit<OTPInputProps, 'children'>

export function InputSymbol({ ref, ...props }: InputSymbolProps) {
  return (
    <div className="flex items-center gap-1">
      <OTPInput
        ref={ref}
        {...props}
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
                className="border-gray-3 text-body-2 relative h-12 w-8 border-b pt-2 pb-4 text-center uppercase group-data-[error=true]/input:border-red-600"
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
    </div>
  )
}
