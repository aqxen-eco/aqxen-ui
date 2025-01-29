'use client'

import { useQuery } from '@tanstack/react-query'
import { MdOutlineInfo } from 'react-icons/md'

import { listOrganizationSubscription } from '@/api/chain/subscription/list-organization-subscription'
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
import { Tooltip } from '@/components/ui/tooltip'
import { useOrganization } from '@/contexts/organization'
import {
  differenceInMinutes,
  minutesToHours,
  parseISO,
  secondsToHours,
} from 'date-fns'
import { OrganizationSubscription } from '@/api/model/subscription'
import { Box } from '@/components/ui/box'

export default function SubscriptionPage() {
  const { name } = useOrganization()

  const query = useQuery({
    queryKey: ['organization-subscription', name],
    queryFn: async () =>
      await listOrganizationSubscription({
        scope: name,
      }),
  })

  console.log(query.data?.rows)

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
        {query.isLoading && <TableSkeleton rows={1} />}
        {query.isSuccess && (
          <>
            {data?.active && data?.active.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-center">
                      Remaining Actions
                    </TableHead>
                    <TableHead className="text-center">Ends in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.active.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-6 capitalize">
                        {row.package}
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        {row.total_actions_bought - row.actions_used}
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        {showEndsIn(row.expiry_time)}
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

      <section className="space-y-2">
        <header className="flex flex-1 items-center gap-1">
          <h2 className="text-title-2 text-white">Upcoming</h2>
          <Tooltip content="Lorem ipsum dolor sit amet">
            <Button variant="link" size="md" square>
              <MdOutlineInfo className="size-6" />
            </Button>
          </Tooltip>
        </header>
        {query.isLoading && <TableSkeleton rows={1} />}
        {query.isSuccess && (
          <>
            {data?.upcoming && data?.upcoming.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Order</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                    <TableHead className="text-center">Term</TableHead>
                    {/* <TableHead className="text-center">Investment</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.upcoming.map((row, index) => (
                    <TableRow key={row.seq_id}>
                      <TableCell className="py-6 text-gray-3">
                        {index + 1}
                      </TableCell>
                      <TableCell className="py-6 capitalize">
                        {row.package}
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        {row.total_actions_bought}
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        {secondsToHours(row.expiry_duration_in_secs) / 24} days
                      </TableCell>
                      {/* <TableCell className="py-6 text-center"></TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box className="flex w-full items-center justify-center text-center">
                <p className="text-body-2 text-gray-3">
                  No upcoming Subscriptions
                </p>
              </Box>
            )}
          </>
        )}
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
        {query.isLoading && <TableSkeleton rows={1} />}
        {query.isSuccess && (
          <>
            {data?.used && data?.used.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Order</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                    <TableHead className="text-center">Term</TableHead>
                    {/* <TableHead className="text-center">Investment</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.used.map((row, index) => (
                    <TableRow key={row.seq_id}>
                      <TableCell className="py-6 text-gray-3">
                        {index + 1}
                      </TableCell>
                      <TableCell className="py-6 capitalize">
                        {row.package}
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        {row.total_actions_bought}
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        {secondsToHours(row.expiry_duration_in_secs) / 24} days
                      </TableCell>
                      {/* <TableCell className="py-6 text-center"></TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box className="flex w-full items-center justify-center text-center">
                <p className="text-body-2 text-gray-3">No Subscription used</p>
              </Box>
            )}
          </>
        )}
      </section>
    </div>
  )
}
