import { Session } from '@wharfkit/session'
import { createContext } from 'react'

export interface SystemContextOptions {
  login: () => Promise<void>
  logout: () => Promise<void>
  session?: Session
  isAuthenticated: boolean | null
}

export const SystemContext = createContext<SystemContextOptions>({
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isAuthenticated: null
})
