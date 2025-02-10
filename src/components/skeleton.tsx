export function TableSkeleton({ columns = 3, rows = 12 }) {
  return (
    <div className="animate-pulse">
      <div className="flex h-8 items-center justify-between px-4">
        {Array.from({ length: columns }, (_, index) => (
          <div
            key={index}
            className="bg-gray-2 h-3.5 w-20 rounded-full max-md:hidden max-md:[&:nth-child(1)]:block max-md:[&:nth-child(2)]:block max-md:[&:nth-child(3)]:block"
          />
        ))}
      </div>
      <div className="divide-gray-2 border-gray-2 bg-gray-1 divide-y rounded-2xl border">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex h-18 items-center justify-between px-4"
          >
            {Array.from({ length: columns }, (_, index) => (
              <div
                key={index}
                className="bg-gray-2 h-4 w-20 rounded-full max-md:hidden max-md:[&:nth-child(1)]:block max-md:[&:nth-child(2)]:block max-md:[&:nth-child(3)]:block"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
