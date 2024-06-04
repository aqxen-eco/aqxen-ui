import { Outlet } from 'react-router-dom'

import { AppBar } from '@/components/features/AppBar'
import { Footer } from '@/components/features/Footer'

export function AppLayout() {
  return (
    <>
      <AppBar />
      <Outlet />
      <Footer />
    </>
  )
}
