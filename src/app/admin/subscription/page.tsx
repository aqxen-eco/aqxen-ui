"use client"

import { listSubscription } from "@/api/chain/subscription/list-subscription";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { secondsToHours } from "date-fns";
import { buySubscription } from "@/api/chain/subscription/buy-subscription";
import { useOrganization } from "@/contexts/organization";
import { useChain } from "@/contexts/chain";
import { listOrganizationSubscription } from "@/api/chain/subscription/list-organization-subscription";
import { Tooltip } from "@/components/ui/tooltip";
import { MdOutlineInfo } from "react-icons/md";


export default function SubscriptionPage() {
  const { session } = useChain();
  const { name } = useOrganization()

  const query = useQuery({ 
    queryKey: ['organization-subscription', name], 
    queryFn: async () => await listOrganizationSubscription({
      scope: name
    }),
  })

  console.log(query)

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <header className="flex-1 flex items-center gap-1">
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
                  <TableCell className="py-6 capitalize">{row.package}</TableCell>
                  <TableCell className="text-center py-6">
                    {row.total_actions_bought - row.actions_used}
                  </TableCell>
                  <TableCell className="text-center py-6">
                    25 days
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="space-y-2">
        <header className="flex-1 flex items-center gap-1">
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
              <TableCell className="text-center py-6">1,000</TableCell>
              <TableCell className="text-center py-6">3 months</TableCell>
              <TableCell className="text-center py-6">100 USD</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-6 text-gray-3">2</TableCell>
              <TableCell className="py-6">Community</TableCell>
              <TableCell className="text-center py-6">100</TableCell>
              <TableCell className="text-center py-6">2 months</TableCell>
              <TableCell className="text-center py-6">50 USD</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="space-y-2">
        <header className="flex-1 flex items-center gap-1">
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
              <TableCell className="text-center py-6">100</TableCell>
              <TableCell className="text-center py-6">3 months</TableCell>
              <TableCell className="text-center py-6">50 USD</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-6 text-gray-3">2</TableCell>
              <TableCell className="py-6">Group</TableCell>
              <TableCell className="text-center py-6">50</TableCell>
              <TableCell className="text-center py-6">1 month</TableCell>
              <TableCell className="text-center py-6">25 USD</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
}