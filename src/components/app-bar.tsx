'use client'

import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { MdClose, MdMenu } from 'react-icons/md'

import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { Link } from '@/components/ui/link'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { useGetUserProfile } from '@/hooks/query/use-get-user-profile'

export function AppBar() {
  const [showMenu, setShowMenu] = useState(false)
  const { isAuthenticated, isInitializing, login, logout, actor } = useChain()
  const { hasOrganization, isPending: isOrgPending } = useOrganization()
  const { data: userProfile } = useGetUserProfile(actor ?? null)
  const pathname = usePathname()
  const router = useRouter()

  const isReady = !isInitializing && (!isAuthenticated || !isOrgPending)

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
                  src="/img/logo.svg"
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              <span className="truncate">AqXen</span>
            </NextLink>

            {/* Desktop nav — always the same wrapper, no layout shift */}
            <div className="flex items-center justify-between max-md:hidden">
              <Link
                href="/"
                variant={pathname === '/' ? 'link' : 'default'}
              >
                Home
              </Link>
              {isReady && !isAuthenticated && (
                <Link
                  href="/about-us"
                  variant={pathname === '/about-us' ? 'link' : 'default'}
                >
                  About
                </Link>
              )}
              {isReady && !isAuthenticated && (
                <Link
                  href="/subscriptions"
                  variant={
                    pathname.includes('/subscriptions') ? 'link' : 'default'
                  }
                >
                  Pricing
                </Link>
              )}
              <Link
                href="/stream"
                variant={pathname === '/stream' ? 'link' : 'default'}
              >
                Stream
              </Link>
              <Link
                href="/organizations"
                variant={
                  pathname.startsWith('/organizations')
                    ? 'link'
                    : 'default'
                }
              >
                Organizations
              </Link>
              {isReady && !isAuthenticated && (
                <>
                  <Link
                    href="/faq"
                    variant={pathname === '/faq' ? 'link' : 'default'}
                  >
                    FAQ
                  </Link>
                  <Link
                    href="/contact"
                    variant={pathname === '/contact' ? 'link' : 'default'}
                  >
                    Contact
                  </Link>
                </>
              )}
              {isReady && isAuthenticated && !hasOrganization && (
                <Link
                  href="/subscriptions"
                  variant={
                    pathname.includes('/subscriptions')
                      ? 'link'
                      : 'default'
                  }
                >
                  Subscriptions
                </Link>
              )}
            </div>

            {/* Mobile menu overlay — only for unauthenticated users */}
            {!(isReady && isAuthenticated) && (
              <div
                data-state={showMenu ? 'open' : 'closed'}
                className="max-md:bg-gray-1 max-md:fixed max-md:inset-0 max-md:z-40 max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-2 max-md:data-[state=closed]:hidden md:hidden"
              >
                <Link
                  href="/"
                  variant={pathname === '/' ? 'link' : 'default'}
                  className="text-2xl"
                >
                  Home
                </Link>
                {isReady && (
                  <Link
                    href="/about-us"
                    variant={pathname === '/about-us' ? 'link' : 'default'}
                    className="text-2xl"
                  >
                    About
                  </Link>
                )}
                {isReady && (
                  <Link
                    href="/subscriptions"
                    variant={
                      pathname.includes('/subscriptions')
                        ? 'link'
                        : 'default'
                    }
                    className="text-2xl"
                  >
                    Pricing
                  </Link>
                )}
                <Link
                  href="/organizations"
                  variant={
                    pathname.startsWith('/organizations')
                      ? 'link'
                      : 'default'
                  }
                  className="text-2xl"
                >
                  Organizations
                </Link>
                <Link
                  href="/stream"
                  variant={pathname === '/stream' ? 'link' : 'default'}
                  className="text-2xl"
                >
                  Stream
                </Link>
                {isReady && (
                  <>
                    <Link
                      href="/faq"
                      variant={pathname === '/faq' ? 'link' : 'default'}
                      className="text-2xl"
                    >
                      FAQ
                    </Link>
                    <Link
                      href="/contact"
                      variant={pathname === '/contact' ? 'link' : 'default'}
                      className="text-2xl"
                    >
                      Contact
                    </Link>
                  </>
                )}
                <Button
                  variant="default"
                  className="absolute top-4 right-4"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MdClose className="size-6" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              {isReady && isAuthenticated ? (
                <DropdownRoot
                  customTrigger={
                    <button
                      type="button"
                      className="group/dropdown-button focus:outline-hidden"
                    >
                      <Avatar
                        color="red"
                        className="group-data-[state=open]/dropdown-button:border-white"
                        src={
                          userProfile?.avatarIpfs
                            ? IPFS_IMAGE_SOURCE + userProfile.avatarIpfs
                            : undefined
                        }
                      >
                        {actor ? actor.slice(0, 2) : 'un'}
                      </Avatar>
                    </button>
                  }
                  align="end"
                >
                  <div className="space-y-2 md:hidden">
                    <DropdownItem asChild>
                      <NextLink href="/">Home</NextLink>
                    </DropdownItem>
                    <DropdownItem asChild>
                      <NextLink href="/stream">Stream</NextLink>
                    </DropdownItem>
                    <DropdownItem asChild>
                      <NextLink href="/organizations">
                        Organizations
                      </NextLink>
                    </DropdownItem>
                  </div>
                  <DropdownItem asChild>
                    <NextLink href={`/profile/${actor}`}>Profile</NextLink>
                  </DropdownItem>
                  {hasOrganization && (
                    <DropdownItem asChild>
                      <NextLink href="/admin/organization">
                        Org Admin
                      </NextLink>
                    </DropdownItem>
                  )}
                  {!hasOrganization && (
                    <div className="md:hidden">
                      <DropdownItem asChild>
                        <NextLink href="/subscriptions">
                          Subscriptions
                        </NextLink>
                      </DropdownItem>
                    </div>
                  )}
                  <DropdownItem onClick={logoutAndGoToHome}>
                    Log out
                  </DropdownItem>
                </DropdownRoot>
              ) : isReady ? (
                <Button onClick={login} variant="primary">
                  Log in
                </Button>
              ) : (
                <div className="size-12" />
              )}
              {!(isReady && isAuthenticated) && (
                <Button
                  variant="default"
                  className="md:hidden"
                  onClick={() => setShowMenu(!showMenu)}
                  square
                >
                  <MdMenu className="size-6" />
                </Button>
              )}
            </div>
          </Box>
        </div>
      </nav>
    </>
  )
}
