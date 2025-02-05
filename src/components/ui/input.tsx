import { twMerge } from 'tailwind-merge'

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={twMerge(
        'block w-full border-b border-gray-3 bg-transparent pb-[calc(1rem-1px)] pt-2 text-body-2 text-white placeholder-gray-3 focus:border-white focus:outline-0',
        className
      )}
      {...props}
    />
  )
}
