'use client'

import { useQuery } from '@tanstack/react-query'

import { listOrganization } from '@/api/chain/organization/list-organization'
import { useChain } from '@/contexts/chain'

export function useGetOrganization(orgName: string | null | undefined) {
  const { actor } = useChain()

  return useQuery({
    queryKey: ['organization', orgName, actor],
    queryFn: () =>
      listOrganization({
        lower_bound: orgName!,
        upper_bound: orgName!,
        actor: actor ?? undefined,
      }),
    enabled: !!orgName,
  })
}
