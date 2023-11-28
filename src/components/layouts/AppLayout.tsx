import { Outlet } from 'react-router-dom'

import { AppBar } from '@/components/features/AppBar'

export function AppLayout() {
  return (
    <>
      <AppBar />
      <Outlet />
    </>
  )
}
