import { Link as RouterLink, NavLink } from 'react-router-dom'

import { ReactComponent as Logo } from '@/assets/logo.svg'
import { Avatar } from '@/components/ui/Avatar'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { button } from '@/styles/button'

export function AppBar() {
  const isAuthenticated = true

  return (
    <>
      <nav className="sticky top-2 z-30 w-full ">
        <div className="mx-auto max-w-container-lg px-4">
          <Box className="flex items-center justify-between rounded-full p-2">
            <RouterLink
              to="/"
              className="flex cursor-pointer items-center gap-2 rounded-full pl-2 pr-3 text-2xl leading-10 text-white duration-150 desktop:hover:bg-gray-2"
            >
              <Logo />
              UpScale
            </RouterLink>
            {isAuthenticated ? (
              <div className="flex gap-2">
                <NavLink
                  to="/recognize"
                  className={({ isActive }) => button({ variant: isActive ? 'secondary' : 'primary' })}
                >
                  Recognize
                </NavLink>
                <NavLink to="/profile">
                  {({ isActive }) => (
                    <Avatar className={isActive ? 'border-white' : ''} color="red">
                      EP
                    </Avatar>
                  )}
                </NavLink>
              </div>
            ) : (
              <Button variant="primary">Sign in</Button>
            )}
          </Box>
        </div>
      </nav>
    </>
  )
}
