import { Chains } from '@wharfkit/common'
import { RouterProvider } from 'react-router-dom'

import BadgesProvider from '@/providers/badges'
import SystemProvider from '@/providers/system'
import { route } from '@/route'

export function App() {
  return (
    <SystemProvider appName="reputationsystem" chains={[Chains.Jungle4]}>
      <BadgesProvider>
        <RouterProvider router={route} />
      </BadgesProvider>
    </SystemProvider>
  )
}
