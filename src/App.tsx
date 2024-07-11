import { Chains } from '@wharfkit/common'
import { RouterProvider } from 'react-router-dom'

import BadgesProvider from '@/providers/badges'
import SeasonsProvider from '@/providers/seasons'
import SystemProvider from '@/providers/system'
import { route } from '@/route'

export function App() {
  return (
    <SystemProvider appName="reputationsystem" chains={[Chains.Jungle4]}>
      <BadgesProvider>
        <SeasonsProvider>
          <RouterProvider router={route} />
        </SeasonsProvider>
      </BadgesProvider>
    </SystemProvider>
  )
}
