import { twMerge } from 'tailwind-merge'

export function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={twMerge('group/field has-[:disabled]:opacity-50', className)}
      {...props}
    />
  )
}

export function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={twMerge('text-body-2 block font-medium text-white', className)}
      {...props}
    />
  )
}

export function ErrorMessage({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  if (!props.children) {
    return null
  }

  return (
    <span
      className={twMerge('text-body-3 mt-2 block text-red-600', className)}
      {...props}
    />
  )
}
