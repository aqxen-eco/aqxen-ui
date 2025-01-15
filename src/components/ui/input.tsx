import { useId } from 'react'
import { MdErrorOutline } from 'react-icons/md'

type InputProps = {
  label?: string
  error?: string
} & React.ComponentProps<'input'>

export function Input({
  label,
  error,
  disabled,
  ref,
  ...restProps
}: InputProps) {
  const id = useId()

  return (
    <div
      className="group/input data-[disabled=true]:opacity-50"
      data-error={!!error}
      data-disabled={!!disabled}
    >
      {label && (
        <label
          htmlFor={id}
          className="block cursor-pointer text-body-2 font-medium text-white group-data-[error=true]/input:text-red-600"
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-1 border-b border-gray-3 focus-within:border-white group-data-[error=true]/input:border-red-600">
        <input
          ref={ref}
          id={id}
          className="flex-1 bg-transparent pb-[calc(1rem-1px)] pt-2 text-body-2 text-white placeholder-gray-3 focus:outline-0"
          disabled={disabled}
          {...restProps}
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
