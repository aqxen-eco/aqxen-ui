'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'
import { toast } from 'react-toastify'

import { getCurrentCycle } from '@/api/chain/billing/get-current-cycle'
import { listFees } from '@/api/chain/billing/list-fees'
import { transferToken } from '@/api/chain/billing/transfer-token'
import { CreateOrgModal } from '@/components/create-org-modal'
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
import { COINGECKO_ID, TOKEN_SYMBOL } from '@/constants'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { formatUsd } from '@/utils/intl-format'

type BuySubscriptionTableProps = {
  paidForCurrentCycle?: boolean
  existingSeats?: number
  activeMembers?: number
}

export function BuySubscriptionTable({
  paidForCurrentCycle,
  existingSeats = 0,
  activeMembers = 0,
}: BuySubscriptionTableProps = {}) {
  const { session } = useChain()
  const { hasOrganization } = useOrganization()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Renewal mode: user has org but hasn't paid for current cycle
  const isRenewalMode = hasOrganization && !paidForCurrentCycle
  // Add seats mode: user has org and has paid
  const isAddSeatsMode = hasOrganization && paidForCurrentCycle

  const [memberCount, setMemberCount] = useState(
    isRenewalMode ? existingSeats : 1,
  )
  const minMembers = isRenewalMode ? Math.max(1, activeMembers) : 1

  const [createOrgModal, setCreateOrgModal] = useState<{
    open: boolean
    orgCreationFee: string
    memberFee: string
  }>({ open: false, orgCreationFee: '', memberFee: '' })

  const query = useQuery({
    queryKey: ['fees'],
    queryFn: async () => await listFees(),
  })

  const tokenPriceQuery = useQuery({
    queryKey: ['token-price'],
    queryFn: async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_ID}&vs_currencies=usd`,
      )
      const data = await res.json()
      return data[COINGECKO_ID].usd as number
    },
    staleTime: 60_000,
  })

  const currentCycleQuery = useQuery({
    queryKey: ['current-cycle'],
    queryFn: async () => await getCurrentCycle(),
  })
  const currentCycleId = currentCycleQuery.data ?? null

  function parseUsdNum(usdValue: string) {
    return parseFloat(usdValue.replace(/[^0-9.]/g, ''))
  }

  function formatToken(usdValue: string, multiplier = 1) {
    if (!tokenPriceQuery.data) return null
    const num = parseUsdNum(usdValue)
    if (isNaN(num)) return null
    return `${((num * multiplier) / tokenPriceQuery.data).toFixed(4)} ${TOKEN_SYMBOL}`
  }

  async function handleBuyPackage({
    org_creation_fee,
    member_fee,
  }: {
    org_creation_fee: string
    member_fee: string
  }) {
    if (!currentCycleId) {
      toast.error('No active billing cycle found')
      return
    }

    if (hasOrganization) {
      try {
        await transferToken({
          session: session!,
          quantity: member_fee,
          currentCycleId,
          memberCount,
        })
        toast.success('Subscription purchased successfully')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await queryClient.refetchQueries({ queryKey: ['billing-detail'] })
        router.push('/admin/subscription')
      } catch {
        toast.error('Failed to purchase subscription')
      }
    } else {
      setCreateOrgModal({
        open: true,
        orgCreationFee: org_creation_fee,
        memberFee: member_fee,
      })
    }
  }

  if (query.isLoading || currentCycleQuery.isLoading || tokenPriceQuery.isLoading) {
    return <TableSkeleton rows={3} columns={4} />
  }

  if (!query.data || query.data.rows.length === 0) {
    return null
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          {!hasOrganization && (
            <TableHead>Organization creation fee (one-time)</TableHead>
          )}
          <TableHead>
            {isRenewalMode ? 'Total seats' : 'Members'}
          </TableHead>
          <TableHead>
            {isRenewalMode
              ? 'Renewal cost (monthly)'
              : isAddSeatsMode
                ? 'Additional seats (monthly)'
                : 'Member fee (monthly)'}
          </TableHead>
          {isAddSeatsMode && (
            <TableHead>New total (monthly)</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {query.data.rows.map((item) => {
          const totalMemberUsd = parseUsdNum(item.member_fee) * memberCount

          return (
            <TableRow key={item.id}>
              {!hasOrganization && (
                <TableCell className="py-6">
                  {formatUsd(item.org_creation_fee)}
                  {formatToken(item.org_creation_fee) && (
                    <>
                      {' '}
                      <span className="text-gray-3">
                        ({formatToken(item.org_creation_fee)})
                      </span>
                    </>
                  )}
                </TableCell>
              )}
              <TableCell className="py-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="md"
                    square
                    onClick={() =>
                      setMemberCount((c) => Math.max(minMembers, c - 1))
                    }
                    disabled={memberCount <= minMembers}
                  >
                    <MdRemove className="size-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {memberCount}
                  </span>
                  <Button
                    variant="secondary"
                    size="md"
                    square
                    onClick={() => setMemberCount((c) => c + 1)}
                  >
                    <MdAdd className="size-4" />
                  </Button>
                </div>
                {isRenewalMode && memberCount < existingSeats && (
                  <p className="text-body-3 text-gray-3 mt-1">
                    Reducing from {existingSeats} seats
                  </p>
                )}
              </TableCell>
              <TableCell className="py-6">
                {`$${totalMemberUsd.toFixed(2)}`}
                {formatToken(item.member_fee, memberCount) && (
                  <>
                    {' '}
                    <span className="text-gray-3">
                      ({formatToken(item.member_fee, memberCount)})
                    </span>
                  </>
                )}
              </TableCell>
              {isAddSeatsMode && (() => {
                const newTotalSeats = existingSeats + memberCount
                const newTotalUsd =
                  parseUsdNum(item.member_fee) * newTotalSeats
                const newTotalToken = formatToken(
                  item.member_fee,
                  newTotalSeats,
                )

                return (
                  <TableCell className="py-6">
                    <div>
                      <span className="font-medium">
                        ${newTotalUsd.toFixed(2)}
                      </span>
                      {newTotalToken && (
                        <>
                          {' '}
                          <span className="text-gray-3">
                            ({newTotalToken})
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-body-3 text-gray-3 mt-1">
                      {newTotalSeats} seats total
                    </p>
                  </TableCell>
                )
              })()}
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
                    {isRenewalMode ? 'Renew' : hasOrganization ? 'Buy' : 'Create Org'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
    {currentCycleId && (
      <CreateOrgModal
        open={createOrgModal.open}
        onOpenChange={(open) =>
          setCreateOrgModal((prev) => ({ ...prev, open }))
        }
        orgCreationFee={createOrgModal.orgCreationFee}
        memberFee={createOrgModal.memberFee}
        currentCycleId={currentCycleId}
        memberCount={memberCount}
      />
    )}
    </>
  )
}
