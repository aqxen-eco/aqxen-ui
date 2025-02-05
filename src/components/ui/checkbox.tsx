import {
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from 'react-icons/md'

export function CheckboxWrapper({ children }: React.ComponentProps<'div'>) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-gray-3 pb-[calc(0.25rem-1px)] pt-1 focus-within:border-white">
      {children}
    </div>
  )
}

export function Checkbox(props: React.ComponentProps<'input'>) {
  return (
    <div className="relative flex size-12 items-center justify-center">
      <input
        type="checkbox"
        className="peer absolute z-10 size-full cursor-pointer appearance-none focus:outline-none"
        {...props}
      />
      <MdOutlineCheckBox className="hidden size-6 fill-white peer-checked:block" />
      <MdOutlineCheckBoxOutlineBlank className="block size-6 fill-gray-3 peer-checked:hidden peer-focus-within:fill-white" />
    </div>
  )
}
