'use client'

import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import { MdChevronRight } from 'react-icons/md'

import {
  HeaderAdmin,
  HeaderAdminTitle,
  navLinks,
} from '@/components/header-admin'
import { Box } from '@/components/ui/box'

function useGreeting() {
  const t = useTranslations('admin.greetings')
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return t('morning')
  } else if (hour >= 12 && hour < 18) {
    return t('afternoon')
  } else {
    return t('evening')
  }
}

export default function AdminPage() {
  const greeting = useGreeting()
  const tn = useTranslations('admin.nav')

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminTitle title={greeting} />
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          {navLinks.map((link) => (
            <Box key={link.labelKey} asChild>
              <NextLink
                href={link.href}
                className="text-title-2 flex items-center justify-between text-white hover:underline"
              >
                {tn(link.labelKey)}
                <MdChevronRight className="size-6" />
              </NextLink>
            </Box>
          ))}
        </div>
      </div>
    </>
  )
}
