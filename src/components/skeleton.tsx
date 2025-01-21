export function TableSkeleton({ columns = 3, rows = 12 }) {
  return (
    <div className="animate-pulse">
      <div className="flex h-8 items-center justify-between px-4">
        {Array.from({ length: columns }, (_, index) => (
          <div
            key={index}
            className="h-3.5 w-20 rounded-full bg-gray-2 mobile:hidden mobile:[&:nth-child(1)]:block mobile:[&:nth-child(2)]:block mobile:[&:nth-child(3)]:block"
          />
        ))}
      </div>
      <div className="divide-y divide-gray-2 rounded-2xl border border-gray-2 bg-gray-1">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex h-[4.5rem] items-center justify-between px-4"
          >
            {Array.from({ length: columns }, (_, index) => (
              <div
                key={index}
                className="h-4 w-20 rounded-full bg-gray-2 mobile:hidden mobile:[&:nth-child(1)]:block mobile:[&:nth-child(2)]:block mobile:[&:nth-child(3)]:block"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
