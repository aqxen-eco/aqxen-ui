import { useQuery } from '@tanstack/react-query'

import { getBillingDetail } from '@/api/chain/billing/get-billing-detail'
import { useChain } from '@/contexts/chain'

export function useGetBillingDetail() {
  const { session } = useChain()

  return useQuery({
    queryKey: ['billing-detail'],
    queryFn: async () => await getBillingDetail({ session: session! }),
  })
}
