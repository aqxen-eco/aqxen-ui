import { Children, type ReactNode } from 'react'

import { twMerge } from 'tailwind-merge'

export function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={twMerge('group/field has-[:disabled]:opacity-50', className)}
      {...props}
    />
  )
}

// Insert a zero-width non-joiner after the first character of text nodes
// to prevent browsers from recognising labels for autofill purposes.
function insertZwnj(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string' && child.length > 1) {
      return child[0] + '\u200C' + child.slice(1)
    }
    return child
  })
}

export function Label({
  className,
  children,
  ...props
}: React.ComponentProps<'label'>) {
  return (
    <label
      className={twMerge(
        'text-body-2 block font-medium text-white',
        className,
      )}
      {...props}
    >
      {insertZwnj(children)}
    </label>
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
