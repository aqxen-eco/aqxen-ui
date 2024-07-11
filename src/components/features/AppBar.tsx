import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom'

import { ReactComponent as Logo } from '@/assets/logo.svg'
import { Avatar } from '@/components/ui/Avatar'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { DropdownItem, DropdownRoot } from '@/components/ui/Dropdown'
import { useChain } from '@/hooks/useChain'

export function AppBar() {
  const { isAuthenticated, login, logout, actor } = useChain()
  const navigate = useNavigate()

  function logoutAndGoToHome() {
    logout()
    navigate('/')
  }

  return (
    <>
      <nav className="sticky top-2 z-30 w-full mobile:top-0">
        <div className="mx-auto max-w-container-lg desktop:px-4">
          <Box className="flex items-center justify-between rounded-full p-2 mobile:rounded-none mobile:border-0 mobile:border-b mobile:p-4">
            <RouterLink
              to="/"
              className="flex cursor-pointer items-center gap-2 rounded-full pl-2 pr-3 text-2xl leading-10 text-white duration-150 desktop:hover:bg-gray-2"
            >
              <Logo />
              UpScale
            </RouterLink>
            {isAuthenticated ? (
              <DropdownRoot
                customTrigger={
                  <button type="button" className="group/dropdown-button">
                    <Avatar color="red" className="group-data-[state=open]/dropdown-button:border-white">
                      {actor ? actor.slice(0, 2) : 'un'}
                    </Avatar>
                  </button>
                }
                align="end"
              >
                <DropdownItem asChild>
                  <NavLink to={'/profile/' + actor}>Profile</NavLink>
                </DropdownItem>
                <DropdownItem onClick={logoutAndGoToHome}>Log out</DropdownItem>
              </DropdownRoot>
            ) : (
              //  <div className="flex gap-2">
              //   Enable when Recognize is available */}
              //   <NavLink
              //     to="/recognize"
              //     className={({ isActive }) => button({ variant: isActive ? 'secondary' : 'primary' })}
              //     >
              //     Recognize
              //     </NavLink>

              //   <NavLink to={'/profile/' + actor}>
              //     {({ isActive }) => (
              //       <Avatar className={isActive ? 'border-white' : ''} color="red">
              //         {actor ? actor.slice(0, 2) : 'un'}
              //       </Avatar>
              //     )}
              //   </NavLink>
              //   <Button onClick={logoutAndGoToHome}>Log out</Button>
              // </div>
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
