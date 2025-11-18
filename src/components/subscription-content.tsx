'use client'

import { secondsToMinutes } from 'date-fns'
import { MdOutlineInfo } from 'react-icons/md'

import { TableSkeleton } from '@/components/skeleton'
import { Box } from '@/components/ui/box'
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
import { useGetSubscription } from '@/hooks/query/use-get-subscription'

export function SubscriptionContent() {
  const { query, data, showEndsIn } = useGetSubscription()

  return (
    <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
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
                      <TableHead className="w-10">Order</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-center">
                        Remaining Actions
                      </TableHead>
                      <TableHead className="text-center">Ends in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="before:border-badge-blue before:bg-badge-blue/50">
                    {data?.active.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="py-6">1</TableCell>
                        <TableCell className="py-6">{row.package}</TableCell>
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
                        <TableCell className="text-gray-3 py-6">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-6">{row.package}</TableCell>
                        <TableCell className="py-6 text-center">
                          {row.total_actions_bought}
                        </TableCell>
                        <TableCell className="py-6 text-center">
                          {secondsToMinutes(row.expiry_duration_in_secs)}{' '}
                          minutes
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

        <section className="space-y-2 opacity-50">
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
                        <TableCell className="text-gray-3 py-6">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-6">{row.package}</TableCell>
                        <TableCell className="py-6 text-center">
                          {row.total_actions_bought}
                        </TableCell>
                        <TableCell className="py-6 text-center">
                          {secondsToMinutes(row.expiry_duration_in_secs)}{' '}
                          minutes
                        </TableCell>
                        {/* <TableCell className="py-6 text-center"></TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box className="flex w-full items-center justify-center text-center">
                  <p className="text-body-2 text-gray-3">
                    No Subscription used
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
