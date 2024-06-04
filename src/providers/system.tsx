import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChainDefinitionType } from '@wharfkit/common'
import { ReactNode, useMemo } from 'react'

import { SystemContext } from '@/contexts/system.ts'
import { useChain } from '@/hooks/useChain.ts'

import ChainProvider from './chain.tsx'

export interface SystemProviderFactoryProps {
  children: ReactNode
}

export interface SystemProviderProps extends SystemProviderFactoryProps {
  appName: string
  chains: ChainDefinitionType[]
}

const queryClient = new QueryClient()

function SystemProviderFactory({ children }: SystemProviderFactoryProps) {
  const { session, logout, login, isAuthenticated } = useChain()

  const systemContextValue = useMemo(
    () => ({
      login,
      logout,
      session,
      isAuthenticated
    }),
    [login, logout, session, isAuthenticated]
  )

  return <SystemContext.Provider value={systemContextValue}>{children}</SystemContext.Provider>
}

export default function SystemProvider({ appName, chains, children }: SystemProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChainProvider appName={appName} chains={chains}>
        <SystemProviderFactory>{children}</SystemProviderFactory>
      </ChainProvider>
    </QueryClientProvider>
  )
}
