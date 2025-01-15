import { useId } from 'react'
import {
  MdErrorOutline,
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from 'react-icons/md'

type CheckboxProps = {
  label: string
  error?: string
} & React.ComponentProps<'input'>

export function Checkbox({ label, error, ref, ...restProps }: CheckboxProps) {
  const id = useId()

  return (
    <div className="group/input" data-error={!!error}>
      <div className="flex items-center gap-2 border-b border-gray-3 focus-within:border-white group-data-[error=true]/input:border-red-600">
        <label
          htmlFor={id}
          className="flex flex-1 cursor-pointer select-none gap-1 py-4 text-body-2 font-medium text-white group-data-[error=true]/input:text-red-600"
        >
          {label}
        </label>
        <div className="relative pr-2">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className="peer absolute z-10 size-full cursor-pointer appearance-none"
            {...restProps}
          />
          <MdOutlineCheckBox className="hidden size-6 peer-checked:block" />
          <MdOutlineCheckBoxOutlineBlank className="block size-6 peer-checked:hidden" />
        </div>
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
