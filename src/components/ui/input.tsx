import { twMerge } from 'tailwind-merge'

export function Input({ className, autoComplete = 'off', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={twMerge(
        'border-gray-3 text-body-2 placeholder-gray-3 block w-full border-b bg-transparent pt-2 pb-[calc(1rem-1px)] text-white focus:border-white focus:outline-0',
        className
      )}
      autoComplete={autoComplete}
      {...props}
    />
  )
}
