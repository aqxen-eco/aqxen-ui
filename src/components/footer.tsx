import NextLink from 'next/link'

export function Footer() {
  const today = new Date()
  const year = today.getFullYear()

  return (
    <footer className="max-w-container-lg mx-auto md:px-4">
      <div className="border-gray-2 flex items-center justify-between gap-4 border-t py-16 max-md:flex-col">
        <NextLink
          href="/"
          className="text-gray-3 flex cursor-pointer items-center gap-1.5 hover:text-white"
        >
          <img src="/img/logo.svg" alt="" className="size-6" />
          <span className="text-body-1">AqXen © {year}</span>
        </NextLink>
        <a
          href="https://detroitledger.tech/"
          target="_blank"
          rel="noreferrer"
          className="opacity-70 hover:opacity-100"
        >
          <img src="/img/dlt.svg" alt="" />
        </a>
      </div>
    </footer>
  )
}
