'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'
import { MdClose } from 'react-icons/md'
import { toast } from 'react-toastify'

import { addActionAuth } from '@/api/chain/badge/add-action-auth'
import { delActionAuth } from '@/api/chain/badge/del-action-auth'
import { getCurrentCycle } from '@/api/chain/billing/get-current-cycle'
import { listFees } from '@/api/chain/billing/list-fees'
import { transferToken } from '@/api/chain/billing/transfer-token'
import { acceptMember } from '@/api/chain/organization/accept-member'
import { addMember } from '@/api/chain/organization/add-member'
import { listMemberRequests } from '@/api/chain/organization/list-member-requests'
import { listMembers } from '@/api/chain/organization/list-members'
import { rejectMember } from '@/api/chain/organization/reject-member'
import { removeMember } from '@/api/chain/organization/remove-member'
import { getOrgMemberReputation } from '@/app/profile/[user]/functions'
import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { TableSkeleton } from '@/components/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useGetBillingDetail } from '@/hooks/query/use-get-billing-detail'
import { formatUsd } from '@/utils/intl-format'

type PendingMemberAction = {
  type: 'add' | 'accept'
  user: string
  memo: string
} | null

const MEMBER_FEE_ERROR =
  'org has not fully paid member fees for current cycle'

export default function MembersPage() {
  const { name } = useOrganization()
  const { session } = useChain()
  const queryClient = useQueryClient()

  const [showAddForm, setShowAddForm] = useState(false)
  const [account, setAccount] = useState('')
  const [memo, setMemo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [pendingAction, setPendingAction] =
    useState<PendingMemberAction>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const membersQuery = useQuery({
    queryKey: ['members', name],
    queryFn: async () => await listMembers({ scope: name }),
  })

  const reputationQuery = useQuery({
    queryKey: ['org-member-reputation', name],
    queryFn: async () => await getOrgMemberReputation({ orgAccount: name }),
  })

  const requestsQuery = useQuery({
    queryKey: ['member-requests', name],
    queryFn: async () => await listMemberRequests({ scope: name }),
  })

  const billingQuery = useGetBillingDetail()

  const feesQuery = useQuery({
    queryKey: ['fees'],
    queryFn: async () => await listFees(),
  })

  const currentCycleQuery = useQuery({
    queryKey: ['current-cycle'],
    queryFn: async () => await getCurrentCycle(),
  })

  const currentCycleId = currentCycleQuery.data ?? null
  const currentBillingDetail = billingQuery.data?.rows.find(
    (row) => String(row.bill_cycle_id) === String(currentCycleId)
  )
  const memberCount = membersQuery.data?.rows.length
  const maxMembers = currentBillingDetail
    ? Number(currentBillingDetail.members_paid_for)
    : undefined

  const slotsAreFull =
    memberCount !== undefined &&
    maxMembers !== undefined &&
    memberCount >= maxMembers

  async function refetchAfterChainAction(queryKeys: string[][]) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await Promise.all(
      queryKeys.map((key) => queryClient.refetchQueries({ queryKey: key }))
    )
  }

  function isMemberFeeError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error)
    return msg.includes(MEMBER_FEE_ERROR)
  }

  const isSelfAdd = account.trim().toLowerCase() === name.toLowerCase()

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!session || !account.trim() || isSelfAdd) return

    if (slotsAreFull) {
      setPendingAction({ type: 'add', user: account.trim(), memo })
      return
    }

    setIsSubmitting(true)
    try {
      await addMember({ session, org: name, user: account.trim(), memo })
      await addActionAuth({
        session,
        org: name,
        action: 'givesimple',
        authorizedAccount: account.trim(),
      })
      setAccount('')
      setMemo('')
      setShowAddForm(false)
      await refetchAfterChainAction([['members', name], ['member-requests', name]])
      toast.success(`${account.trim()} has been added as a member.`)
    } catch (error) {
      if (isMemberFeeError(error)) {
        toast.error('Member limit reached. Please purchase an additional seat.')
        await refetchAfterChainAction([['members', name], ['member-requests', name]])
      } else {
        toast.error('Failed to update member')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAccept(user: string) {
    if (!session) return

    if (slotsAreFull) {
      setPendingAction({ type: 'accept', user, memo: '' })
      return
    }

    try {
      await acceptMember({ session, org: name, user, memo: '' })
      await addActionAuth({
        session,
        org: name,
        action: 'givesimple',
        authorizedAccount: user,
      })
      await refetchAfterChainAction([['members', name], ['member-requests', name]])
      toast.success(`${user} has been accepted.`)
    } catch (error) {
      if (isMemberFeeError(error)) {
        toast.error('Member limit reached. Please purchase an additional seat.')
        await refetchAfterChainAction([['members', name], ['member-requests', name]])
      } else {
        toast.error('Failed to update member')
      }
    }
  }

  async function handleReject(user: string) {
    if (!session) return
    try {
      await rejectMember({ session, org: name, user, memo: '' })
      await refetchAfterChainAction([['members', name], ['member-requests', name]])
      toast.success(`${user} has been rejected.`)
    } catch {
      toast.error('Failed to reject member')
    }
  }

  async function handleRemove(user: string) {
    if (!session) return
    try {
      await removeMember({ session, org: name, user, memo: '' })
      try {
        await delActionAuth({
          session,
          org: name,
          action: 'givesimple',
          authorizedAccount: user,
        })
      } catch {
        // Member may not have been in the action auth table
      }
      await refetchAfterChainAction([['members', name], ['member-requests', name]])
      toast.success(`${user} has been removed.`)
    } catch {
      toast.error('Failed to remove member')
    }
  }

  async function handleBuySlot() {
    const fee = feesQuery.data?.rows[0]
    if (!session || !currentCycleId || !fee) return
    setIsPurchasing(true)
    try {
      await transferToken({
        session,
        quantity: fee.member_fee,
        currentCycleId,
      })
      await refetchAfterChainAction([['billing-detail']])
      setPendingAction(null)
      toast.success('Member slot purchased! You can now retry the action.')
    } catch {
      toast.error('Failed to purchase member slot')
    } finally {
      setIsPurchasing(false)
    }
  }

  const memberFee = feesQuery.data?.rows[0]?.member_fee

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/members" />
        <HeaderAdminTitle title="Members">
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add member'}
          </Button>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        {showAddForm && (
          <form
            onSubmit={handleAddMember}
            className="border-gray-2 bg-gray-1 mb-8 rounded-2xl border p-6"
          >
            <h2 className="text-title-2 mb-4 text-white">Add member</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  placeholder="Account name"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Memo (optional)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || !account.trim() || isSelfAdd}
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
            {isSelfAdd && (
              <p className="text-body-2 mt-2 text-red-400">
                You cannot add yourself as a member.
              </p>
            )}
          </form>
        )}

        <section className="mb-8">
          <h2 className="text-title-2 mb-4 text-white">Pending requests</h2>
          {requestsQuery.isLoading && <TableSkeleton columns={4} rows={3} />}
          {requestsQuery.isSuccess &&
            requestsQuery.data.rows.length === 0 && (
              <p className="text-body-2 text-gray-3">
                No pending requests.
              </p>
            )}
          {requestsQuery.isSuccess &&
            requestsQuery.data.rows.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead>Requested at</TableHead>
                    <TableHead className="w-28" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsQuery.data.rows.map((row) => (
                    <TableRow key={row.account}>
                      <TableCell>{row.account}</TableCell>
                      <TableCell className="text-gray-3">
                        {row.memo || '-'}
                      </TableCell>
                      <TableCell className="text-gray-3">
                        {format(new Date(row.requested_at), 'EEE d MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleAccept(row.account)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => handleReject(row.account)}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </section>

        <section>
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-title-2 text-white">
              {memberCount !== undefined && maxMembers !== undefined
                ? `Members (${memberCount} / ${maxMembers})`
                : 'Members'}
            </h2>
            {memberCount !== undefined &&
              maxMembers !== undefined &&
              memberCount >= maxMembers && (
                <Button asChild variant="primary" size="md">
                  <Link href="/pricing">
                    Buy Additional Seats
                  </Link>
                </Button>
              )}
          </div>
          {membersQuery.isLoading && <TableSkeleton columns={3} rows={6} />}
          {membersQuery.isSuccess &&
            membersQuery.data.rows.length === 0 && (
              <p className="text-body-2 text-gray-3">No members yet.</p>
            )}
          {membersQuery.isSuccess &&
            membersQuery.data.rows.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Reputation</TableHead>
                    <TableHead>Joined at</TableHead>
                    <TableHead className="w-44" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersQuery.data.rows.map((row) => (
                    <TableRow key={row.account}>
                      <TableCell>{row.account}</TableCell>
                      <TableCell className="text-gray-3">
                        {reputationQuery.data?.[row.account] ?? 0}
                      </TableCell>
                      <TableCell className="text-gray-3">
                        {format(new Date(row.joined_at), 'EEE d MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="primary" size="md">
                            <Link href={`/profile/${row.account}`}>
                              View Profile
                            </Link>
                          </Button>
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => handleRemove(row.account)}
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </section>
      </div>

      <Dialog.Root
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
      >
        <AnimatePresence>
          {pendingAction && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay forceMount asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/50"
                />
              </Dialog.Overlay>
              <Dialog.Content forceMount asChild>
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 32 }}
                  className="border-gray-2 bg-gray-1 fixed top-1/2 left-1/2 z-60 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-8 shadow-lg"
                >
                  <Dialog.Close asChild>
                    <Button
                      size="md"
                      variant="link"
                      square
                      className="absolute top-4 right-4"
                    >
                      <MdClose className="size-6" />
                    </Button>
                  </Dialog.Close>
                  <Dialog.Title className="text-title-1 text-white">
                    Member limit reached
                  </Dialog.Title>
                  <Dialog.Description className="text-body-2 text-gray-3 mt-2">
                    {`Your organization has used all ${maxMembers ?? '?'} paid member slot${maxMembers === 1 ? '' : 's'}. Purchase an additional seat to ${pendingAction.type === 'add' ? 'add' : 'accept'} ${pendingAction.user}.`}
                  </Dialog.Description>
                  {memberFee && (
                    <p className="text-body-2 mt-4 text-white">
                      Monthly member fee:{' '}
                      <span className="font-semibold">{formatUsd(memberFee)}</span>
                    </p>
                  )}
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      size="md"
                      disabled={isPurchasing || !currentCycleId || !memberFee}
                      onClick={handleBuySlot}
                    >
                      {isPurchasing
                        ? 'Purchasing...'
                        : 'Buy Additional Seat'}
                    </Button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  )
}
