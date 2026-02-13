'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { getCurrentCycle } from '@/api/chain/billing/get-current-cycle'
import { listFees } from '@/api/chain/billing/list-fees'
import { transferToken } from '@/api/chain/billing/transfer-token'
import { acceptMember } from '@/api/chain/organization/accept-member'
import { addMember } from '@/api/chain/organization/add-member'
import { listMemberRequests } from '@/api/chain/organization/list-member-requests'
import { listMembers } from '@/api/chain/organization/list-members'
import { rejectMember } from '@/api/chain/organization/reject-member'
import { removeMember } from '@/api/chain/organization/remove-member'
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
  const [purchaseComplete, setPurchaseComplete] = useState(false)

  const membersQuery = useQuery({
    queryKey: ['members', name],
    queryFn: async () => await listMembers({ scope: name }),
  })

  const requestsQuery = useQuery({
    queryKey: ['member-requests', name],
    queryFn: async () => await listMemberRequests({ scope: name }),
  })

  const billingQuery = useGetBillingDetail()

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

  function invalidateQueries() {
    queryClient.invalidateQueries({ queryKey: ['members', name] })
    queryClient.invalidateQueries({ queryKey: ['member-requests', name] })
  }

  function isMemberFeeError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error)
    return msg.includes(MEMBER_FEE_ERROR)
  }

  function handleMemberError(
    error: unknown,
    action: PendingMemberAction
  ) {
    if (isMemberFeeError(error)) {
      setPendingAction(action)
      setPurchaseComplete(false)
    } else {
      toast.error('Failed to update member')
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!session || !account.trim()) return
    setIsSubmitting(true)
    try {
      await addMember({ session, org: name, user: account.trim(), memo })
      setAccount('')
      setMemo('')
      setShowAddForm(false)
      invalidateQueries()
    } catch (error) {
      handleMemberError(error, {
        type: 'add',
        user: account.trim(),
        memo,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAccept(user: string) {
    if (!session) return
    try {
      await acceptMember({ session, org: name, user, memo: '' })
      invalidateQueries()
    } catch (error) {
      handleMemberError(error, { type: 'accept', user, memo: '' })
    }
  }

  async function handleReject(user: string) {
    if (!session) return
    try {
      await rejectMember({ session, org: name, user, memo: '' })
      invalidateQueries()
    } catch {
      toast.error('Failed to reject member')
    }
  }

  async function handleRemove(user: string) {
    if (!session) return
    try {
      await removeMember({ session, org: name, user, memo: '' })
      invalidateQueries()
    } catch {
      toast.error('Failed to remove member')
    }
  }

  async function handleBuySlot() {
    if (!session || !currentCycleId) return
    setIsPurchasing(true)
    try {
      const fees = await listFees()
      const fee = fees.rows[0]
      if (!fee) {
        toast.error('Could not load member fee')
        return
      }
      await transferToken({
        session,
        quantity: fee.member_fee,
        currentCycleId,
      })
      queryClient.invalidateQueries({ queryKey: ['billing-detail'] })
      setPurchaseComplete(true)
    } catch {
      toast.error('Failed to purchase member slot')
    } finally {
      setIsPurchasing(false)
    }
  }

  async function handleRetry() {
    if (!session || !pendingAction) return
    setIsSubmitting(true)
    try {
      if (pendingAction.type === 'add') {
        await addMember({
          session,
          org: name,
          user: pendingAction.user,
          memo: pendingAction.memo,
        })
        setAccount('')
        setMemo('')
        setShowAddForm(false)
      } else {
        await acceptMember({
          session,
          org: name,
          user: pendingAction.user,
          memo: pendingAction.memo,
        })
      }
      setPendingAction(null)
      setPurchaseComplete(false)
      invalidateQueries()
    } catch (error) {
      if (isMemberFeeError(error)) {
        setPurchaseComplete(false)
      } else {
        toast.error('Failed to update member')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
        {pendingAction && (
          <div className="border-gray-2 bg-gray-1 mb-8 rounded-2xl border p-6">
            <h2 className="text-title-2 mb-2 text-white">
              Member limit reached
            </h2>
            <p className="text-body-2 text-gray-3 mb-4">
              {`Your organization has used all ${maxMembers ?? '?'} paid member slot${maxMembers === 1 ? '' : 's'}. Purchase an additional slot to ${pendingAction.type === 'add' ? 'add' : 'accept'} ${pendingAction.user}.`}
            </p>
            {!purchaseComplete ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  disabled={isPurchasing || !currentCycleId}
                  onClick={handleBuySlot}
                >
                  {isPurchasing ? 'Purchasing...' : 'Buy Member Slot'}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setPendingAction(null)
                    setPurchaseComplete(false)
                  }}
                >
                  Dismiss
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  onClick={handleRetry}
                >
                  {isSubmitting
                    ? 'Retrying...'
                    : `Retry ${pendingAction.type === 'add' ? 'adding' : 'accepting'} ${pendingAction.user}`}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setPendingAction(null)
                    setPurchaseComplete(false)
                  }}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        )}

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
                disabled={isSubmitting || !account.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
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
          <h2 className="text-title-2 mb-4 text-white">
            {memberCount !== undefined && maxMembers !== undefined
              ? `Members (${memberCount} / ${maxMembers})`
              : 'Members'}
          </h2>
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
                    <TableHead>Joined at</TableHead>
                    <TableHead className="w-28" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersQuery.data.rows.map((row) => (
                    <TableRow key={row.account}>
                      <TableCell>{row.account}</TableCell>
                      <TableCell className="text-gray-3">
                        {format(new Date(row.joined_at), 'EEE d MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => handleRemove(row.account)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </section>
      </div>
    </>
  )
}
