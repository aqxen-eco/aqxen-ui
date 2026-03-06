import { twMerge } from 'tailwind-merge'

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="w-full overflow-x-auto overflow-y-clip">
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
        'text-gray-3 px-4 pb-2 text-left font-normal text-nowrap',
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
        'before:border-gray-2 before:bg-gray-1 relative before:absolute before:inset-0 before:-z-10 before:size-full before:rounded-2xl before:border before:content-[""] [&_tr:last-child]:border-0',
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
    <tr className={twMerge('border-gray-2 border-b', className)} {...props} />
  )
}

export function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={twMerge('text-body-2 p-4 text-white', className)}
      {...props}
    />
  )
}
