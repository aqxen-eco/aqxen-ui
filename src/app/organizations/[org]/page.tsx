'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { listMemberRequests } from '@/api/chain/organization/list-member-requests'
import { listMembers } from '@/api/chain/organization/list-members'
import { listOrganization } from '@/api/chain/organization/list-organization'
import { requestJoin } from '@/api/chain/organization/request-join'
import { TableSkeleton } from '@/components/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useChain } from '@/contexts/chain'

export default function OrganizationPage() {
  const { org } = useParams<{ org: string }>()
  const { session, isAuthenticated, actor } = useChain()
  const queryClient = useQueryClient()
  const [isRequesting, setIsRequesting] = useState(false)

  const orgQuery = useQuery({
    queryKey: ['organization', org],
    queryFn: async () =>
      await listOrganization({ lower_bound: org, upper_bound: org }),
  })

  const membersQuery = useQuery({
    queryKey: ['members', org],
    queryFn: async () => await listMembers({ scope: org }),
  })

  const requestsQuery = useQuery({
    queryKey: ['member-requests', org],
    queryFn: async () => await listMemberRequests({ scope: org }),
    enabled: isAuthenticated,
  })

  const hasPendingRequest = requestsQuery.data?.rows.some(
    (row) => row.account === actor
  )

  const orgData = orgQuery.data?.rows[0]
  const ipfsImage = orgData?.offchain_lookup_data?.user?.ipfs_image
  const displayName =
    orgData?.onchain_lookup_data?.user?.display_name || org
  const initials = displayName.slice(0, 2).toUpperCase()
  const shortDescription =
    orgData?.onchain_lookup_data?.user?.short_description
  const aboutText = orgData?.onchain_lookup_data?.user?.about
  const purposeText = orgData?.onchain_lookup_data?.user?.purpose
  const createdAt = orgData?.onchain_lookup_data?.system?.created_at

  async function handleRequestJoin() {
    if (!session) return
    setIsRequesting(true)
    try {
      await requestJoin({ session, org, memo: '' })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.refetchQueries({ queryKey: ['member-requests', org] })
      toast.success(`Request to join ${org} has been sent.`)
    } catch {
      toast.error('Failed to send join request.')
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 py-12">
      <section className="mb-12 flex flex-col items-center gap-4 text-center">
        {orgQuery.isLoading && (
          <div className="animate-pulse">
            <div className="bg-gray-2 mx-auto size-24 rounded-full" />
            <div className="bg-gray-2 mx-auto mt-4 h-6 w-48 rounded-full" />
            <div className="bg-gray-2 mx-auto mt-2 h-4 w-32 rounded-full" />
          </div>
        )}
        {orgData && (
          <>
            <Avatar
              size="lg"
              color="blue"
              src={
                ipfsImage ? `${IPFS_IMAGE_SOURCE}${ipfsImage}` : undefined
              }
            >
              {initials}
            </Avatar>
            <div>
              <h1 className="text-title-1 text-white">{displayName}</h1>
              <p className="text-body-2 text-gray-3">{org}</p>
              {shortDescription && (
                <p className="text-body-2 text-gray-3 mt-2">
                  {shortDescription}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {isAuthenticated && actor === org && (
                <Button asChild variant="primary" size="lg">
                  <Link href="/admin/organization">Manage Organization</Link>
                </Button>
              )}
              {isAuthenticated && actor !== org && (
                hasPendingRequest ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled
                    className="border-gray-3 text-gray-3 opacity-100"
                  >
                    Request Pending
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isRequesting}
                    onClick={handleRequestJoin}
                  >
                    {isRequesting ? 'Requesting...' : 'Request to Join'}
                  </Button>
                )
              )}
            </div>
          </>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-title-2 mb-4 text-white">About Organization</h2>
        {orgQuery.isLoading && (
          <div className="animate-pulse">
            <div className="bg-gray-2 h-4 w-64 rounded-full" />
          </div>
        )}
        {orgData && (
          <div className="space-y-4">
            {createdAt && (
              <p className="text-body-2 text-gray-3">
                Created {format(new Date(createdAt * 1000), 'MMMM d, yyyy')}
              </p>
            )}
            {aboutText && (
              <p className="text-body-2 text-gray-3 whitespace-pre-line">
                {aboutText}
              </p>
            )}
          </div>
        )}
      </section>

      {(orgQuery.isLoading || purposeText) && (
        <section className="mb-12">
          <h2 className="text-title-2 mb-4 text-white">
            Organization Purpose
          </h2>
          {orgQuery.isLoading && (
            <div className="animate-pulse">
              <div className="bg-gray-2 h-4 w-64 rounded-full" />
            </div>
          )}
          {purposeText && (
            <p className="text-body-2 text-gray-3 whitespace-pre-line">
              {purposeText}
            </p>
          )}
        </section>
      )}

      <section>
        <h2 className="text-title-2 mb-4 text-white">Members</h2>
        {membersQuery.isLoading && <TableSkeleton columns={2} rows={4} />}
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
                  <TableHead>Joined</TableHead>
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
                      <Button asChild variant="primary" size="md">
                        <Link href={`/profile/${row.account}`}>
                          View Profile
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </section>
    </div>
  )
}
