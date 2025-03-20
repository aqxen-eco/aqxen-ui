'use client'

import { useQuery } from '@tanstack/react-query'
import { secondsToMinutes } from 'date-fns'
import { useRouter } from 'next/navigation'

import { createOrganizationAndBuySubscription } from '@/api/chain/organization/create-organization-and-buy-subscription'
import { buySubscription } from '@/api/chain/subscription/buy-subscription'
import { listSubscription } from '@/api/chain/subscription/list-subscription'
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

export function BuySubscriptionTable() {
  const { session } = useChain()
  const { name, hasOrganization } = useOrganization()
  const router = useRouter()

  const query = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => await listSubscription(),
  })

  async function handleBuyPackage({
    subPackage,
    quantity,
  }: {
    subPackage: string
    quantity: string
  }) {
    try {
      if (hasOrganization) {
        await buySubscription({
          session: session!,
          quantity,
          memo: `${name}:${subPackage}`,
        })
      } else {
        await createOrganizationAndBuySubscription({
          session: session!,
          quantity,
          subPackage,
        })
      }
      router.push('/admin/subscription')
    } catch {}
  }

  if (query.isLoading) {
    return <TableSkeleton rows={3} columns={4} />
  }

  if (!query.data || query.data.rows.length === 0) {
    return null
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tier</TableHead>
          <TableHead className="text-center">Actions</TableHead>
          <TableHead className="text-center">Term</TableHead>
          <TableHead className="text-center">Investment</TableHead>
          <TableHead className="text-center">Recommended for</TableHead>
          <TableHead className="w-24"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {query.data.rows.map((item) => (
          <TableRow key={item.package}>
            <TableCell className="py-6">{item.descriptive_name}</TableCell>
            <TableCell className="py-6 text-center">
              {item.action_size}
            </TableCell>
            <TableCell className="py-6 text-center">
              {secondsToMinutes(item.expiry_duration_in_secs)} minutes
            </TableCell>
            <TableCell className="py-6 text-center">
              {item.cost.quantity}
            </TableCell>
            <TableCell className="py-6 text-center">
              {item.action_size / 10} members
            </TableCell>
            <TableCell>
              {session && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    handleBuyPackage({
                      quantity: item.cost.quantity,
                      subPackage: item.package,
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
