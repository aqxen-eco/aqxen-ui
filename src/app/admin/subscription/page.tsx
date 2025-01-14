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
    
{/* <section className="space-y-2">
  <header className="flex-1 flex items-center gap-1">
    <h2 className="text-title-2 text-white">Cycles</h2>
    <Tooltip content="Lorem ipsum dolor sit amet">
      <Button variant="link" size="md" square>
        <MdOutlineInfo className="size-6" />
      </Button>
    </Tooltip>
  </header>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead className="text-center">Start</TableHead>
        <TableHead className="text-center">End</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="py-6">1</TableCell>
        <TableCell className="text-center py-6">
          2024-11-12 00:00
        </TableCell>
        <TableCell className="text-center py-6">
          2024-11-26 23:59
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="py-6">2</TableCell>
        <TableCell className="text-center py-6">
          2024-11-12 00:00
        </TableCell>
        <TableCell className="text-center py-6">
          2024-11-26 23:59
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</section> */}