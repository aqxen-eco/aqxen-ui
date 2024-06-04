import { Link as RouterLink } from 'react-router-dom'

import { ReactComponent as DLT } from '@/assets/dlt.svg'
import { ReactComponent as Logo } from '@/assets/logo.svg'

export function Footer() {
  const today = new Date()
  const year = today.getFullYear()

  return (
    <footer className="mx-auto flex max-w-container-lg items-center justify-between border-t border-gray-2 px-4 py-16">
      <RouterLink to="/" className="flex cursor-pointer items-center gap-1.5 text-gray-3 desktop:hover:text-white">
        <Logo className="h-6 w-6" />
        <span className="text-body-1">UpScale © {year}</span>
      </RouterLink>
      <a
        href="https://detroitledger.tech/"
        target="_blank"
        rel="noreferrer"
        className="opacity-70 desktop:hover:opacity-100"
      >
        <DLT />
      </a>
    </footer>
  )
}
