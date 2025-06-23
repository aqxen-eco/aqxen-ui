import NextLink from 'next/link'
import { MdChevronRight } from 'react-icons/md'

import {
  HeaderAdmin,
  HeaderAdminTitle,
  navLinks,
} from '@/components/header-admin'
import { Box } from '@/components/ui/box'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return 'Good morning!'
  } else if (hour >= 12 && hour < 18) {
    return 'Good afternoon!'
  } else {
    return 'Good evening!'
  }
}

export default function AdminPage() {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminTitle title={getGreeting()} />
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          {navLinks.map((link) => (
            <Box key={link.label} asChild>
              <NextLink
                href={link.href}
                className="text-title-2 flex items-center justify-between text-white hover:underline"
              >
                {link.label}
                <MdChevronRight className="size-6" />
              </NextLink>
            </Box>
          ))}
        </div>
      </div>
    </>
  )
}
