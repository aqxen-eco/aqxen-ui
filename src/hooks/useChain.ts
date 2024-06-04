import { Session } from '@wharfkit/session'
import { useContext } from 'react'

import { ChainContext } from '@/contexts/chain.ts'

export interface ChainOptions<T extends boolean = boolean> {
  login: () => Promise<void>
  logout: () => Promise<void>
  session?: Session
  isAuthenticated: T | null
  actor: T extends true ? string : undefined
  permission?: string
}

export function useChain(): ChainOptions {
  const { login, logout, isAuthenticated, session } = useContext(ChainContext)

  return {
    login,
    logout,
    session,
    isAuthenticated,
    actor: session?.actor?.toString(),
    permission: session?.permission?.toString()
  }
}
