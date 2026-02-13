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
  shortDescription: string
  about: string
  purpose: string
  hasOrganization: boolean
  isPending: boolean
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
  const shortDescription =
    query.data?.rows[0]?.onchain_lookup_data?.user.short_description ?? ''
  const about = query.data?.rows[0]?.onchain_lookup_data?.user.about ?? ''
  const purpose = query.data?.rows[0]?.onchain_lookup_data?.user.purpose ?? ''

  return (
    <OrganizationContext
      value={{
        name,
        symbol,
        hasOrganization: !!name,
        ipfs,
        createdAt,
        displayName,
        shortDescription,
        about,
        purpose,
        isPending: query.isPending,
      }}
    >
      {children}
    </OrganizationContext>
  )
}

export function useOrganization() {
  const {
    name,
    symbol,
    hasOrganization,
    ipfs,
    createdAt,
    displayName,
    shortDescription,
    about,
    purpose,
    isPending,
  } = use(OrganizationContext)

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
    shortDescription,
    about,
    purpose,
    addOrganizationSymbol,
    removeOrganizationSymbol,
    isPending,
  }
}
