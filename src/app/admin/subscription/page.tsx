'use client'

import { useQuery } from '@tanstack/react-query'
import { MdOutlineInfo } from 'react-icons/md'

import { listOrganizationSubscription } from '@/api/chain/subscription/list-organization-subscription'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip } from '@/components/ui/tooltip'
import { useOrganization } from '@/contexts/organization'

export default function SubscriptionPage() {
  // const { session } = useChain()
  const { name } = useOrganization()

  const query = useQuery({
    queryKey: ['organization-subscription', name],
    queryFn: async () =>
      await listOrganizationSubscription({
        scope: name,
      }),
  })

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <header className="flex flex-1 items-center gap-1">
          <h2 className="text-title-2 text-white">Active Subscription</h2>
          <Tooltip content="Lorem ipsum dolor sit amet">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </header>
        {(query.isSuccess || (query.data && query.data.rows.length > 0)) && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead className="text-center">Remaining Actions</TableHead>
                <TableHead className="text-center">Ends in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="py-6 capitalize">
                    {row.package}
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    {row.total_actions_bought - row.actions_used}
                  </TableCell>
                  <TableCell className="py-6 text-center">25 days</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="space-y-2">
        <header className="flex flex-1 items-center gap-1">
          <h2 className="text-title-2 text-white">Upcoming</h2>
          <Tooltip content="Lorem ipsum dolor sit amet">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Order</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-center">Actions</TableHead>
              <TableHead className="text-center">Term</TableHead>
              <TableHead className="text-center">Investment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-6 text-gray-3">1</TableCell>
              <TableCell className="py-6">Professional</TableCell>
              <TableCell className="py-6 text-center">1,000</TableCell>
              <TableCell className="py-6 text-center">3 months</TableCell>
              <TableCell className="py-6 text-center">100 USD</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-6 text-gray-3">2</TableCell>
              <TableCell className="py-6">Community</TableCell>
              <TableCell className="py-6 text-center">100</TableCell>
              <TableCell className="py-6 text-center">2 months</TableCell>
              <TableCell className="py-6 text-center">50 USD</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="space-y-2">
        <header className="flex flex-1 items-center gap-1">
          <h2 className="text-title-2 text-white">Used</h2>
          <Tooltip content="Lorem ipsum dolor sit amet">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Order</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-center">Actions</TableHead>
              <TableHead className="text-center">Term</TableHead>
              <TableHead className="text-center">Investment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-6 text-gray-3">1</TableCell>
              <TableCell className="py-6">Community</TableCell>
              <TableCell className="py-6 text-center">100</TableCell>
              <TableCell className="py-6 text-center">3 months</TableCell>
              <TableCell className="py-6 text-center">50 USD</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-6 text-gray-3">2</TableCell>
              <TableCell className="py-6">Group</TableCell>
              <TableCell className="py-6 text-center">50</TableCell>
              <TableCell className="py-6 text-center">1 month</TableCell>
              <TableCell className="py-6 text-center">25 USD</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  )
}
