import { twMerge } from 'tailwind-merge'

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="w-full overflow-auto">
      <table className={twMerge('w-full', className)} {...props} />
    </div>
  )
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={twMerge(
        'text-body-3 font-normal [&>tr]:first:border-b-0',
        className
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={twMerge(
        'text-nowrap px-4 pb-2 text-left font-normal text-gray-3',
        className
      )}
      {...props}
    />
  )
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      className={twMerge(
        'relative before:absolute before:inset-0 before:-z-10 before:size-full before:rounded-2xl before:border before:border-gray-2 before:bg-gray-1 before:content-[""] [&_tr:last-child]:border-0',
        className
      )}
      {...props}
    />
  )
}

export function TableFooter({
  className,
  ...props
}: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      className={twMerge('[&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr className={twMerge('border-b border-gray-2', className)} {...props} />
  )
}

export function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={twMerge('p-4 text-body-2 text-white', className)}
      {...props}
    />
  )
}
