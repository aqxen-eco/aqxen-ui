'use client'

import { TableSkeleton } from '@/components/skeleton'
import { Box } from '@/components/ui/box'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useGetBillingDetail } from '@/hooks/query/use-get-billing-detail'

export function SubscriptionContent() {
  const billing = useGetBillingDetail()

  return (
    <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
      <div className="space-y-8">
        <section className="space-y-2">
          {billing.isLoading && <TableSkeleton rows={1} />}
          {billing.isSuccess && (
            <>
              {billing.data?.rows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Bill cycle ID</TableHead>
                      <TableHead>Amount paid</TableHead>
                      <TableHead className="text-center">
                        Members paid for
                      </TableHead>
                      <TableHead className="text-center">
                        Allowed actions
                      </TableHead>
                      <TableHead className="text-center">
                        Used actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billing.data?.rows.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="py-6">
                          {String(row.bill_cycle_id)}
                        </TableCell>
                        <TableCell className="py-6">
                          {row.amount_paid}
                        </TableCell>
                        <TableCell className="py-6 text-center">
                          {String(row.members_paid_for)}
                        </TableCell>
                        <TableCell className="py-6 text-center">
                          {String(row.allowed_actions)}
                        </TableCell>
                        <TableCell className="py-6 text-center">
                          {String(row.used_actions)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box className="flex w-full items-center justify-center text-center">
                  <p className="text-body-2 text-gray-3">
                    No Subscriptions activated
                  </p>
                </Box>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
