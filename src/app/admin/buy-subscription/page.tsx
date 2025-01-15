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


export default function AtiveSubscriptionPage() {
  const { session } = useChain();
  const { name } = useOrganization()

  const query = useQuery({ 
    queryKey: ['subscription'], 
    queryFn: async () => await listSubscription(),
  })

  async function handleBuyPackage({ subPackage, quantity }: { subPackage:string, quantity: string }) {
    await buySubscription({
      session: session!,
      quantity,
      memo: `${name}:${subPackage}`,
    });
  }


  return (
    <>
      {(query.isSuccess || (query.data && query.data.rows.length > 0)) && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tier</TableHead>
              <TableHead className="text-center">Actions</TableHead>
              <TableHead className="text-center">Term</TableHead>
              <TableHead className="text-center">Investment</TableHead>
              {/* <TableHead className="text-center">Recommended for</TableHead> */}
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.rows.map((row) => row.display && row.active ? (
              <TableRow key={row.package}>
                <TableCell className="py-6 capitalize">{row.descriptive_name}</TableCell>
                <TableCell className="text-center py-6">{row.action_size}</TableCell>
                <TableCell className="text-center py-6">{(secondsToHours(row.expiry_duration_in_secs) / 24)} days</TableCell>
                <TableCell className="text-center py-6">{row.cost.quantity}</TableCell>
                {/* <TableCell className="text-center py-6"></TableCell> */}
                <TableCell>
                  <Button variant="secondary" size="md" onClick={() => handleBuyPackage({ quantity: row.cost.quantity, subPackage: row.package })}>Buy</Button>
                </TableCell>
              </TableRow>
            ): null)}
          </TableBody>
        </Table>
      )}
    </>
  );
}