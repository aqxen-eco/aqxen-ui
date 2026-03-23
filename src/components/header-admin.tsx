'use client'

import type { LinkProps } from 'next/link'
import { useTranslations } from 'next-intl'
import { MdKeyboardArrowLeft } from 'react-icons/md'
import { MdOutlineInfo } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Tooltip } from '@/components/ui/tooltip'

export const navLinks = [
  {
    labelKey: 'organization',
    href: '/admin/organization',
  },
  {
    labelKey: 'members',
    href: '/admin/members',
  },
  {
    labelKey: 'beams',
    href: '/admin/beams',
  },
  {
    labelKey: 'badges',
    href: '/admin/badges',
  },
  {
    labelKey: 'badgeAutomation',
    href: '/admin/badges-automation',
  },
  {
    labelKey: 'seasons',
    href: '/admin/seasons',
  },
  {
    labelKey: 'subscription',
    href: '/admin/subscription',
  },
] as const

type HeaderAdminProps = {
  children?: React.ReactNode
}

export function HeaderAdmin({ children }: HeaderAdminProps) {
  return <div className="max-md:pt-2 md:pt-4">{children}</div>
}

type HeaderAdminMenuProps = {
  activeHref?: (typeof navLinks)[number]['href']
}

export function HeaderAdminMenu({ activeHref }: HeaderAdminMenuProps) {
  const t = useTranslations('admin.nav')
  return (
    <div className="max-w-container-lg mx-auto md:px-4">
      <nav className="border-gray-2 overflow-x-auto border-b pb-2">
        <ul className="flex gap-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                variant={activeHref === link.href ? 'link' : 'default'}
              >
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

type HeaderAdminBackProps = {
  children: React.ReactNode
} & LinkProps

export function HeaderAdminBack({ children, ...props }: HeaderAdminBackProps) {
  return (
    <div className="max-w-container-lg mx-auto md:px-4">
      <nav className="border-gray-2 overflow-x-auto border-b pb-2">
        <Link {...props} variant="default">
          <MdKeyboardArrowLeft className="size-6" />
          {children}
        </Link>
      </nav>
    </div>
  )
}

type HeaderAdminTitleProps = {
  title: string | React.ReactNode
  tooltip?: string
  className?: string
  children?: React.ReactNode
}

export function HeaderAdminTitle({
  title,
  tooltip,
  className,
  children,
}: HeaderAdminTitleProps) {
  return (
    <div className={twMerge('max-w-container-lg mx-auto px-4 py-8', className)}>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-1">
          <h1 className="text-title-1 text-white">{title}</h1>
          {tooltip && (
            <Tooltip content={tooltip}>
              <Button variant="link" size="md" square>
                <MdOutlineInfo className="size-6" />
              </Button>
            </Tooltip>
          )}
        </div>
        {children && <div className="flex flex-none gap-2">{children}</div>}
      </header>
    </div>
  )
}
