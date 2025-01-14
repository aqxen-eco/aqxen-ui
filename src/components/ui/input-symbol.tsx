"use client";

import { OTPInput, REGEXP_ONLY_CHARS, type OTPInputProps } from "input-otp";
import { useId } from "react";
import { MdErrorOutline } from "react-icons/md";

type InputSymbolProps = {
  label?: string;
  error?: string;
  ref: React.Ref<HTMLInputElement> | undefined
} & Omit<OTPInputProps, "children">;

export function InputSymbol({
  label,
  error,
  ref,
  ...props
}: InputSymbolProps) {
  const id = useId();

  return (
    <div className="group/input" data-error={!!error}>
      {label && (
        <label
          htmlFor={id}
          className="text-body-2 font-medium text-white block cursor-pointer group-data-[error=true]/input:text-red-600"
        >
          {label}
        </label>
      )}
      <div className="flex gap-1 items-center">
        <OTPInput
          ref={ref}
          {...props}
          id={id}
          textAlign="center"
          inputMode="text"
          pattern={REGEXP_ONLY_CHARS}
          containerClassName="flex gap-2 items-center w-full"
          style={{ width: "100%" }}
          render={({ slots }) => (
            <>
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="w-8 pt-2 pb-4 h-12 border-b text-center uppercase border-gray-3 relative text-body-2 group-data-[error=true]/input:border-red-600"
                >
                  {slot.char !== null && slot.char}
                  {(slot.hasFakeCaret || slot.isActive) && (
                    <div className="w-full h-px bg-white rounded-ful absolute -bottom-px z-10" />
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
  );
}