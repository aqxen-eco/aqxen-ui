import { ChainDefinitionType } from '@wharfkit/common'
import SessionKit, { Session } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet'
import WebRenderer from '@wharfkit/web-renderer'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { ChainContext } from '@/contexts/chain.ts'

export interface ChainProviderProps {
  appName: string
  chains: ChainDefinitionType[]
  children: ReactNode
}

export default function ChainProvider({ appName, chains, children }: ChainProviderProps) {
  const [session, setSession] = useState<Session>()
  const isAuthenticated = session != null ? !!session?.actor.toString() : null

  const { sessionKit, localStorageSessionKey } = useMemo(() => {
    const internalAppNameSlug = appName.replace(' ', '_').toLowerCase()

    const internalSessionKit = new SessionKit({
      appName: internalAppNameSlug,
      chains,
      ui: new WebRenderer(),
      walletPlugins: [new WalletPluginAnchor(), new WalletPluginCloudWallet()]
    })

    const internalLocalStorageSessionKey = `wharf-${internalSessionKit.appName}-session`

    return {
      sessionKit: internalSessionKit,
      appNameSlug: internalAppNameSlug,
      localStorageSessionKey: internalLocalStorageSessionKey
    }
  }, [appName, chains])

  const logout = useCallback(async () => {
    await sessionKit.logout(session)
    setSession(undefined)
  }, [session, sessionKit])

  const login = useCallback(async () => {
    const response = await sessionKit.login()
    setSession(response.session)
  }, [sessionKit])

  const restoreSession = useCallback(async () => {
    try {
      const restoredSession = await sessionKit.restore()
      setSession(restoredSession)
    } catch {
      setSession(undefined)
    }
  }, [sessionKit])

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  useEffect(() => {
    // handle what happens on key press
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === localStorageSessionKey && event.newValue == null) {
        setSession(undefined)
      } else if (event.key === localStorageSessionKey && event.newValue != null) {
        void restoreSession()
      }
    }

    // attach the event listener
    window.addEventListener('storage', handleStorageChange)

    // remove the event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [localStorageSessionKey, restoreSession])

  const chainContextValue = useMemo(
    () => ({
      login,
      logout,
      session,
      isAuthenticated
    }),
    [login, logout, session, isAuthenticated]
  )

  return <ChainContext.Provider value={chainContextValue}>{children}</ChainContext.Provider>
}
