'use client'

import { useQuery } from '@tanstack/react-query'
import { createContext, use } from 'react'

import { listOrganization } from '@/api/chain/organization/list-organization'
import { useChain } from '@/contexts/chain'

type OrganizationContext = {
  name: string
  symbol: string
  hasOrganization: boolean
}

const OrganizationContext = createContext({} as OrganizationContext)

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { actor } = useChain()

  const query = useQuery({
    queryKey: ['organization_symbol', actor],
    queryFn: async () =>
      await listOrganization({ lower_bound: actor!, upper_bound: actor! }),
    enabled: !!actor,
  })

  const name = query.data?.rows[0]?.org ?? ''
  const symbol = query.data?.rows[0]?.org_code ?? ''

  return (
    <OrganizationContext value={{ name, symbol, hasOrganization: !!name }}>
      {children}
    </OrganizationContext>
  )
}

export function useOrganization() {
  const { name, symbol, hasOrganization } = use(OrganizationContext)

  return {
    name,
    symbol,
    hasOrganization,
  }
}
