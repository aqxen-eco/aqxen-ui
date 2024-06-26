import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom'

import { ReactComponent as Logo } from '@/assets/logo.svg'
import { Avatar } from '@/components/ui/Avatar'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { useChain } from '@/hooks/useChain'
import { button } from '@/styles/button'

import { DropdownItem, DropdownRoot } from '../ui/Dropdown'

export function AppBar() {
  const { isAuthenticated, login, logout, actor } = useChain()
  const navigate = useNavigate()

  function logoutAndGoToHome() {
    logout()
    navigate('/')
  }

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
            <DropdownRoot label="Dropdown">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((item) => (
                <DropdownItem key={item} isSelected={item === 1} onClick={() => console.log(`click item ${item}`)}>
                  Item {item}
                </DropdownItem>
              ))}
            </DropdownRoot>
            {isAuthenticated ? (
              <div className="flex gap-2">
                <NavLink
                  to="/recognize"
                  className={({ isActive }) => button({ variant: isActive ? 'secondary' : 'primary' })}
                >
                  Recognize
                </NavLink>
                <NavLink to={'/profile/' + actor}>
                  {({ isActive }) => (
                    <Avatar className={isActive ? 'border-white' : ''} color="red">
                      {actor ? actor.slice(0, 2) : 'un'}
                    </Avatar>
                  )}
                </NavLink>
                <Button onClick={logoutAndGoToHome}>Log out</Button>
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
