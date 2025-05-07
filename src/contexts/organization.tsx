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
    queryKey: ['organization', actor],
    queryFn: async () =>
      await listOrganization({ lower_bound: actor!, upper_bound: actor! }),
    enabled: !!actor,
  })

  const name = query.data?.rows[0]?.org ?? ''
  const symbol = query.data?.rows[0]?.org_code ?? ''
  const ipfs = query.data?.rows[0]?.offchain_lookup_data?.user.ipfs_image ?? ''
  const createdAt =
    String(query.data?.rows[0]?.onchain_lookup_data?.system.created_at) ?? ''
  const displayName =
    query.data?.rows[0]?.onchain_lookup_data?.user.display_name ?? ''

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

  function addOrganizationSymbol(value: string) {
    return (symbol + value).toUpperCase()
  }

  function removeOrganizationSymbol(value: string) {
    return value.split(',')[1].replace(symbol?.toUpperCase(), '')
  }

  return {
    name,
    symbol,
    hasOrganization,
    ipfs,
    createdAt,
    displayName,
    addOrganizationSymbol,
    removeOrganizationSymbol,
  }
}
