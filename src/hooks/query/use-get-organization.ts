'use client'

import { useQuery } from '@tanstack/react-query'

import { listOrganization } from '@/api/chain/organization/list-organization'

export function useGetOrganization(orgName: string | null | undefined) {
  return useQuery({
    queryKey: ['organization', orgName],
    queryFn: () =>
      listOrganization({
        lower_bound: orgName!,
        upper_bound: orgName!,
      }),
    enabled: !!orgName,
  })
}
