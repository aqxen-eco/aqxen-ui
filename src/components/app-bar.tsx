'use client'

import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { MdClose } from 'react-icons/md'

import { MutualRecognition } from '@/components/mutual-recognition'
import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { Link } from '@/components/ui/link'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

export function AppBar() {
  const [showMenu, setShowMenu] = useState(false)
  const { isAuthenticated, login, logout, actor } = useChain()
  const { hasOrganization, displayName, ipfs } = useOrganization()
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
              className="hover:bg-gray-2 flex cursor-pointer items-center gap-2 overflow-hidden rounded-full pr-3 pl-2 text-2xl leading-10 text-white duration-150"
            >
              <div className="relative size-6 flex-none overflow-hidden rounded-full">
                <img
                  src={ipfs ? IPFS_IMAGE_SOURCE + ipfs : '/img/logo.svg'}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              <span className="truncate">{displayName || 'AqXen'}</span>
            </NextLink>

            <Button
              variant="default"
              className="md:hidden"
              onClick={() => setShowMenu(!showMenu)}
            >
              Menu
            </Button>
            <div
              data-state={showMenu ? 'open' : 'closed'}
              className="max-md:bg-gray-1 flex items-center justify-between max-md:fixed max-md:inset-0 max-md:z-40 max-md:flex-col max-md:justify-center max-md:gap-2 data-[state=closed]:max-md:hidden"
            >
              <Link
                href="/"
                variant={pathname === '/' ? 'link' : 'default'}
                className="max-md:text-2xl"
              >
                Home
              </Link>
              <Link
                href="/about-us"
                variant={pathname === '/about-us' ? 'link' : 'default'}
                className="max-md:text-2xl"
              >
                About Us
              </Link>
              <Link
                href="/stream"
                variant={pathname === '/stream' ? 'link' : 'default'}
                className="max-md:text-2xl"
              >
                Stream
              </Link>
              <Link
                href="/contact"
                variant={pathname === '/contact' ? 'link' : 'default'}
                className="max-md:text-2xl"
              >
                Contact
              </Link>
              <Link
                href="/faq"
                variant={pathname === '/faq' ? 'link' : 'default'}
                className="max-md:text-2xl"
              >
                FAQ
              </Link>
              {isAuthenticated && (
                <Link
                  href={`/profile/${actor}`}
                  variant={pathname.includes('/profile') ? 'link' : 'default'}
                  className="max-md:text-2xl"
                >
                  Profile
                </Link>
              )}
              {hasOrganization ? (
                <>
                  <Button
                    variant="default"
                    className="absolute top-4 right-4 md:hidden"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <MdClose className="size-6" />
                  </Button>
                  <Link
                    href="/feed"
                    variant={pathname.includes('/feed') ? 'link' : 'default'}
                    className="max-md:text-2xl"
                  >
                    Feed
                  </Link>
                  <Link
                    href="/admin/organization"
                    variant={pathname.includes('/admin') ? 'link' : 'default'}
                    className="max-md:text-2xl"
                  >
                    Admin
                  </Link>
                </>
              ) : (
                <Link
                  href="/subscriptions"
                  variant={
                    pathname.includes('/subscriptions') ? 'link' : 'default'
                  }
                  className="max-md:text-2xl"
                >
                  Subscriptions
                </Link>
              )}
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {hasOrganization && <MutualRecognition />}
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
              </div>
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
