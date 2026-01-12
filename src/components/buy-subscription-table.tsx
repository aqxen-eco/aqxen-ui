'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

// import { getCurrentCycle } from '@/api/chain/billing/get-current-cycle'
import { listFees } from '@/api/chain/billing/list-fees'
import { createOrganization } from '@/api/chain/organization/create-organization'
import { buySubscription } from '@/api/chain/subscription/buy-subscription'
import { TableSkeleton } from '@/components/skeleton'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { useGetCycle } from '@/hooks/query/use-get-cycle'

export function BuySubscriptionTable() {
  const { session } = useChain()
  const { hasOrganization } = useOrganization()
  const router = useRouter()

  const query = useQuery({
    queryKey: ['fees'],
    queryFn: async () => await listFees(),
  })

  // const getCurrentCycleQuery = useQuery({
  //   queryKey: ['current-cycle'],
  //   queryFn: async () => await getCurrentCycle(),
  // })

  const cycleQuery = useGetCycle()

  async function handleBuyPackage({
    org_creation_fee,
    member_fee,
  }: {
    org_creation_fee: string
    member_fee: string
  }) {
    const currentCycleId = cycleQuery.data?.rows[0].bill_cycle_id!
    try {
      if (hasOrganization) {
        await buySubscription({
          session: session!,
          quantity: member_fee,
          currentCycleId,
        })
      } else {
        await createOrganization({
          session: session!,
          org_creation_fee,
          member_fee,
          currentCycleId,
        })
      }
      router.push('/admin/subscription')
    } catch {}
  }

  if (query.isLoading || cycleQuery.isLoading) {
    return <TableSkeleton rows={3} columns={4} />
  }

  if (!query.data || query.data.rows.length === 0) {
    return null
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization creation fee</TableHead>
          <TableHead>Member fee</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {query.data.rows.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="py-6">{item.org_creation_fee}</TableCell>
            <TableCell className="py-6">{item.member_fee}</TableCell>
            <TableCell className="text-right">
              {session && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    handleBuyPackage({
                      org_creation_fee: item.org_creation_fee,
                      member_fee: item.member_fee,
                    })
                  }
                >
                  Buy
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
