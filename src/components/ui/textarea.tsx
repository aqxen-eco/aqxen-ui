import { twMerge } from 'tailwind-merge'

export function Textarea({
  className,
  children,
  autoComplete = 'off',
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={twMerge(
        'border-gray-3 text-body-2 placeholder-gray-3 block field-sizing-content w-full resize-none border-b bg-transparent pt-2 pb-[calc(1rem-1px)] text-white focus:border-white focus:outline-0',
        className
      )}
      autoComplete={autoComplete}
      {...props}
    >
      {children}
    </textarea>
  )
}
