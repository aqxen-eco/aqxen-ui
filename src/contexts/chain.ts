import { Session } from '@wharfkit/session'
import { createContext } from 'react'

export interface ChainContextOptions {
  login: () => Promise<void>
  logout: () => Promise<void>
  session?: Session
  isAuthenticated: boolean | null
}

export const ChainContext = createContext<ChainContextOptions>({
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isAuthenticated: null
})
