'use client'

import { useQuery } from '@tanstack/react-query'

import { getUserProfile } from '@/app/profile/[user]/functions'

export function useGetUserProfile(actor: string | null) {
  return useQuery({
    queryKey: ['users', actor],
    queryFn: () => getUserProfile({ actor: actor! }),
    enabled: !!actor,
  })
}
