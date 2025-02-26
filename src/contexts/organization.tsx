'use client'

import { useQuery } from '@tanstack/react-query'
import { createContext, use } from 'react'

import { listOrganization } from '@/api/chain/organization/list-organization'
import { useChain } from '@/contexts/chain'

type OrganizationContext = {
  name: string
  symbol: string
  ipfs: string
  createdAt: string
  displayName: string
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
  const ipfs = query.data?.rows[0]?.offchain_lookup_data?.ipfs ?? ''
  const createdAt =
    String(query.data?.rows[0]?.onchain_lookup_data?.created_at) ?? ''
  const displayName = query.data?.rows[0]?.onchain_lookup_data?.name ?? ''

  return (
    <OrganizationContext
      value={{
        name,
        symbol,
        hasOrganization: !!name,
        ipfs,
        createdAt,
        displayName,
      }}
    >
      {children}
    </OrganizationContext>
  )
}

export function useOrganization() {
  const { name, symbol, hasOrganization, ipfs, createdAt, displayName } =
    use(OrganizationContext)

  return {
    name,
    symbol,
    hasOrganization,
    ipfs,
    createdAt,
    displayName,
  }
}
