import { useQuery } from '@tanstack/react-query'

import { listCycle } from '@/api/chain/cycle/list-cycle'

export function useGetCycle() {
  return useQuery({
    queryKey: ['cycle'],
    queryFn: async () => await listCycle({}),
  })
}
