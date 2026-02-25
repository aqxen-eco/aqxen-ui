'use client'

import { Chains } from '@wharfkit/common'
import SessionKit, { type Session } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import WebRenderer from '@wharfkit/web-renderer'
import { createContext, use, useCallback, useEffect, useState } from 'react'

type ChainContext = {
  login: () => Promise<void>
  logout: () => Promise<void>
  session?: Session
  isAuthenticated: boolean
  isInitializing: boolean
}

const ChainContext = createContext({} as ChainContext)

const appName = 'reputationsystem'

const sessionKit = new SessionKit({
  appName,
  chains: [Chains.Jungle4],
  ui: new WebRenderer(),
  walletPlugins: [new WalletPluginAnchor()],
})

const localStorageSessionKey = `wharf-${sessionKit.appName}-session`

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>()
  const [isInitializing, setIsInitializing] = useState(true)
  const isAuthenticated = session != null ? !!session?.actor.toString() : false

  async function logout() {
    await sessionKit.logout(session)
    setSession(undefined)
    await fetch('/api/auth/logout', { method: 'POST' })
  }

  async function login() {
    const response = await sessionKit.login()
    setSession(response.session)
    const actor = response.session.actor.toString()
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor }),
    })
  }

  const restoreSession = useCallback(async () => {
    try {
      const restoredSession = await sessionKit.restore()
      setSession(restoredSession)
      if (restoredSession) {
        const actor = restoredSession.actor.toString()
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actor }),
        })
      }
    } catch {
      setSession(undefined)
    } finally {
      setIsInitializing(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    // handle what happens on key press
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === localStorageSessionKey && event.newValue == null) {
        setSession(undefined)
      } else if (
        event.key === localStorageSessionKey &&
        event.newValue != null
      ) {
        restoreSession()
      }
    }

    // attach the event listener
    window.addEventListener('storage', handleStorageChange)

    // remove the event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [restoreSession])

  return (
    <ChainContext
      value={{
        login,
        logout,
        session,
        isAuthenticated,
        isInitializing,
      }}
    >
      {children}
    </ChainContext>
  )
}

export function useChain() {
  const { login, logout, isAuthenticated, isInitializing, session } =
    use(ChainContext)

  return {
    login,
    logout,
    session,
    isAuthenticated,
    isInitializing,
    actor: session?.actor?.toString(),
    permission: session?.permission?.toString(),
  }
}
