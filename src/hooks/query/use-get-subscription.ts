'use client'

import { useQuery } from '@tanstack/react-query'
import { differenceInMinutes, minutesToHours, parseISO } from 'date-fns'

import { listOrganizationSubscription } from '@/api/chain/subscription/list-organization-subscription'
import { OrganizationSubscription } from '@/api/model/subscription'
import { useOrganization } from '@/contexts/organization'

export function useGetSubscription() {
  const { name } = useOrganization()

  const query = useQuery({
    queryKey: ['organization-subscription', name],
    queryFn: async () =>
      await listOrganizationSubscription({
        scope: name,
      }),
  })

  const data = query.data?.rows?.reduce(
    (accumulator, currentValue) => {
      if (currentValue.status === 'new') {
        accumulator.upcoming.push(currentValue)
        return accumulator
      }

      if (currentValue.status === 'used') {
        accumulator.used.push(currentValue)
        return accumulator
      }

      accumulator.active.push(currentValue)
      return accumulator
    },
    {
      active: [] as OrganizationSubscription[],
      upcoming: [] as OrganizationSubscription[],
      used: [] as OrganizationSubscription[],
    }
  )

  function showEndsIn(value: string) {
    const today = new Date()
    const expiryTime = parseISO(value)
    const resultInMinutes = differenceInMinutes(expiryTime, today)

    if (resultInMinutes <= 0) {
      return 'Expired'
    }

    if (resultInMinutes < 60) {
      return `${resultInMinutes} minutes`
    }
    const resultInHours = minutesToHours(resultInMinutes)

    if (resultInHours < 24) {
      return `${resultInHours} hours`
    }

    return `${Math.floor(resultInHours / 24)} days`
  }

  return {
    query,
    data,
    showEndsIn,
  }
}
