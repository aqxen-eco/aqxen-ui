'use client'

import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { cancelRequest } from '@/api/chain/organization/cancel-request'
import { listMemberRequests } from '@/api/chain/organization/list-member-requests'
import { listMembers } from '@/api/chain/organization/list-members'
import { listOrganization } from '@/api/chain/organization/list-organization'
import { requestJoin } from '@/api/chain/organization/request-join'
import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { HIDDEN_ORGS, IPFS_IMAGE_SOURCE } from '@/constants'
import { useChain } from '@/contexts/chain'

export default function OrganizationsPage() {
  const { session, isAuthenticated, actor } = useChain()
  const queryClient = useQueryClient()
  const t = useTranslations('organizations')
  const [requestingOrg, setRequestingOrg] = useState<string | null>(null)
  const [cancellingOrg, setCancellingOrg] = useState<string | null>(null)

  const orgsQuery = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => await listOrganization({}),
  })

  const orgs = (orgsQuery.data?.rows ?? []).filter(
    (org) => !HIDDEN_ORGS.includes(org.org),
  )

  const nonOwnedOrgs = orgs.filter((org) => org.org !== actor)

  const requestQueries = useQueries({
    queries: isAuthenticated
      ? nonOwnedOrgs.map((org) => ({
          queryKey: ['member-requests', org.org],
          queryFn: async () => await listMemberRequests({ scope: org.org }),
        }))
      : [],
  })

  const memberQueries = useQueries({
    queries: isAuthenticated
      ? nonOwnedOrgs.map((org) => ({
          queryKey: ['members', org.org],
          queryFn: async () => await listMembers({ scope: org.org }),
        }))
      : [],
  })

  const pendingOrgNames = new Set<string>()
  const memberOrgNames = new Set<string>()
  nonOwnedOrgs.forEach((org, i) => {
    const requestQuery = requestQueries[i]
    if (
      requestQuery?.isSuccess &&
      requestQuery.data.rows.some((row) => row.account === actor)
    ) {
      pendingOrgNames.add(org.org)
    }
    const memberQuery = memberQueries[i]
    if (
      memberQuery?.isSuccess &&
      memberQuery.data.rows.some((row) => row.account === actor)
    ) {
      memberOrgNames.add(org.org)
    }
  })

  async function handleCancelRequest(org: string) {
    if (!session) return
    setCancellingOrg(org)
    try {
      await cancelRequest({ session, org })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.refetchQueries({ queryKey: ['member-requests', org] })
      toast.success(t('requestCancelled'))
    } catch {
      toast.error(t('cancelFailed'))
    } finally {
      setCancellingOrg(null)
    }
  }

  async function handleRequestJoin(org: string) {
    if (!session) return
    setRequestingOrg(org)
    try {
      await requestJoin({ session, org, memo: '' })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.refetchQueries({ queryKey: ['member-requests', org] })
      toast.success(t('requestSent', { org }))
    } catch {
      toast.error(t('requestFailed'))
    } finally {
      setRequestingOrg(null)
    }
  }

  return (
    <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-title-1 mb-2 text-white">
          {t('heading')}
        </h1>
        <p className="text-body-2 text-gray-3">
          {t('subheading')}
        </p>
      </div>

      {orgsQuery.isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Box key={i} className="animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-gray-2 size-24 rounded-full" />
                <div className="bg-gray-2 h-5 w-32 rounded-full" />
                <div className="bg-gray-2 h-4 w-24 rounded-full" />
              </div>
            </Box>
          ))}
        </div>
      )}

      {orgsQuery.isSuccess && orgsQuery.data.rows.length === 0 && (
        <p className="text-body-2 text-gray-3 text-center">
          {t('noOrganizations')}
        </p>
      )}

      {orgsQuery.isSuccess && orgsQuery.data.rows.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orgsQuery.data.rows.map((org) => {
            const ipfsImage = org.offchain_lookup_data?.user?.ipfs_image
            const displayName =
              org.onchain_lookup_data?.user?.display_name || org.org
            const shortDescription =
              org.onchain_lookup_data?.user?.short_description
            const initials = displayName.slice(0, 2).toUpperCase()

            return (
              <Box
                key={org.org}
                className="flex flex-col items-center gap-4 text-center"
              >
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
                  <h2 className="text-title-2 text-white">{displayName}</h2>
                  <p className="text-body-3 text-gray-3">{org.org}</p>
                  {shortDescription && (
                    <p className="text-body-2 text-gray-3 mt-2">
                      {shortDescription}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="primary" size="md">
                    <Link href={`/organizations/${org.org}`}>{t('view')}</Link>
                  </Button>
                  {isAuthenticated &&
                    actor !== org.org &&
                    !memberOrgNames.has(org.org) && (
                    pendingOrgNames.has(org.org) ? (
                      <Button
                        variant="secondary"
                        size="md"
                        disabled={cancellingOrg === org.org}
                        onClick={() => handleCancelRequest(org.org)}
                      >
                        {cancellingOrg === org.org
                          ? t('cancelling')
                          : t('cancelRequest')}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="md"
                        disabled={requestingOrg === org.org}
                        onClick={() => handleRequestJoin(org.org)}
                      >
                        {requestingOrg === org.org
                          ? t('requesting')
                          : t('requestToJoin')}
                      </Button>
                    )
                  )}
                </div>
              </Box>
            )
          })}
        </div>
      )}
    </div>
  )
}
