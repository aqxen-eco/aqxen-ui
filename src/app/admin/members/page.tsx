'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'

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

export default function MembersPage() {
  const { name } = useOrganization()
  const { session } = useChain()
  const queryClient = useQueryClient()

  const [showAddForm, setShowAddForm] = useState(false)
  const [account, setAccount] = useState('')
  const [memo, setMemo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const membersQuery = useQuery({
    queryKey: ['members', name],
    queryFn: async () => await listMembers({ scope: name }),
  })

  const requestsQuery = useQuery({
    queryKey: ['member-requests', name],
    queryFn: async () => await listMemberRequests({ scope: name }),
  })

  function invalidateQueries() {
    queryClient.invalidateQueries({ queryKey: ['members', name] })
    queryClient.invalidateQueries({ queryKey: ['member-requests', name] })
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
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAccept(user: string) {
    if (!session) return
    await acceptMember({ session, org: name, user, memo: '' })
    invalidateQueries()
  }

  async function handleReject(user: string) {
    if (!session) return
    await rejectMember({ session, org: name, user, memo: '' })
    invalidateQueries()
  }

  async function handleRemove(user: string) {
    if (!session) return
    await removeMember({ session, org: name, user, memo: '' })
    invalidateQueries()
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
          <h2 className="text-title-2 mb-4 text-white">Members</h2>
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
