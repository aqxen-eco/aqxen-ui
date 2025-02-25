'use client'

import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { Link } from '@/components/ui/link'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

export function AppBar() {
  const { isAuthenticated, login, logout, actor } = useChain()
  const { hasOrganization } = useOrganization()
  const pathname = usePathname()
  const router = useRouter()

  function logoutAndGoToHome() {
    logout()
    router.push('/')
  }

  return (
    <>
      <nav className="sticky top-2 z-30 w-full max-md:top-0">
        <div className="max-w-container-lg mx-auto md:px-4">
          <Box className="flex items-center justify-between rounded-full p-2 max-md:rounded-none max-md:border-0 max-md:border-b max-md:p-4">
            <NextLink
              href="/"
              className="hover:bg-gray-2 flex cursor-pointer items-center gap-2 rounded-full pr-3 pl-2 text-2xl leading-10 text-white duration-150"
            >
              <img src="/img/logo.svg" alt="" />
              UpScale
            </NextLink>

            {isAuthenticated ? (
              <>
                {hasOrganization && (
                  <Link
                    href="/admin/organization"
                    variant={pathname.includes('/admin') ? 'link' : 'default'}
                  >
                    Admin
                  </Link>
                )}

                <DropdownRoot
                  customTrigger={
                    <button
                      type="button"
                      className="group/dropdown-button focus:outline-hidden"
                    >
                      <Avatar
                        color="red"
                        className="group-data-[state=open]/dropdown-button:border-white"
                      >
                        {actor ? actor.slice(0, 2) : 'un'}
                      </Avatar>
                    </button>
                  }
                  align="end"
                >
                  <DropdownItem asChild>
                    <NextLink href={`/profile/${actor}`}>Profile</NextLink>
                  </DropdownItem>
                  <DropdownItem onClick={logoutAndGoToHome}>
                    Log out
                  </DropdownItem>
                </DropdownRoot>
              </>
            ) : (
              <Button onClick={login} variant="primary">
                Log in
              </Button>
            )}
          </Box>
        </div>
      </nav>
    </>
  )
}
