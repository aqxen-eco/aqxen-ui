'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  MdClose,
  MdOutlineDynamicFeed,
  MdOutlinePeople,
} from 'react-icons/md'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { sendMultiBadge } from '@/api/chain/badge/send-multi-badge'
import { cancelRequest } from '@/api/chain/organization/cancel-request'
import { listMemberRequests } from '@/api/chain/organization/list-member-requests'
import { listMembers } from '@/api/chain/organization/list-members'
import { listOrganization } from '@/api/chain/organization/list-organization'
import { requestJoin } from '@/api/chain/organization/request-join'
import { createPost, getPosts } from '@/app/feed/actions'
import { PostItem, PostItemComment } from '@/app/feed/post-item'
import { TableSkeleton } from '@/components/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxEmpty,
  ComboboxItem,
} from '@/components/ui/combobox'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { InputBadges } from '@/components/ui/input-badges'
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

const sortList = [
  { description: 'Latest', value: 'desc' },
  { description: 'Oldest', value: 'asc' },
]

const orgPostSchema = z
  .object({
    content: z.string().nonempty('Post content is required'),
    recognize: z.boolean(),
    recipientAccount: z.string().optional(),
    badges: z.string().array().optional(),
  })
  .refine(
    (data) =>
      !data.recognize ||
      (data.recipientAccount && data.recipientAccount.length > 0),
    { message: 'Select a member to recognize', path: ['recipientAccount'] }
  )
  .refine(
    (data) => !data.recognize || (data.badges && data.badges.length > 0),
    { message: 'Select at least one badge', path: ['badges'] }
  )

type OrgPostSchema = z.infer<typeof orgPostSchema>

const tabClass =
  'text-body-2 text-gray-3 relative flex shrink-0 cursor-pointer items-center gap-2 pb-4 font-medium data-[state=active]:text-white data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:left-0 data-[state=active]:before:h-0.5 data-[state=active]:before:w-full data-[state=active]:before:bg-white'

export default function OrganizationPage() {
  const { org } = useParams<{ org: string }>()
  const { session, isAuthenticated, actor } = useChain()
  const queryClient = useQueryClient()
  const [isRequesting, setIsRequesting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [activeTab, setActiveTab] = useState<'stream' | 'members'>('stream')
  const [sort, setSort] = useState<Record<string, string>>(sortList[0])
  const loadMoreBtnRef = useRef(null)

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

  const isMember = membersQuery.data?.rows.some(
    (m) => m.account === actor
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

  // Post form
  const { control, register, handleSubmit, watch, reset, setValue } =
    useForm<OrgPostSchema>({
      resolver: zodResolver(orgPostSchema),
      defaultValues: {
        content: '',
        recognize: false,
        recipientAccount: '',
        badges: [],
      },
    })

  const recognizeWatched = watch('recognize')
  const contentWatched = watch('content')
  const recipientWatched = watch('recipientAccount')
  const badgesWatched = watch('badges')

  const filteredMembers = useMemo(
    () =>
      membersQuery.data?.rows.filter((m) => m.account !== actor) ?? [],
    [membersQuery.data, actor]
  )

  const canSubmit = (() => {
    if (!contentWatched) return false
    if (recognizeWatched) {
      return (
        !!recipientWatched &&
        recipientWatched.length > 0 &&
        !!badgesWatched &&
        badgesWatched.length > 0
      )
    }
    return true
  })()

  // Posts query
  const postsQuery = useInfiniteQuery({
    queryKey: ['posts', sort.value, 'org', org],
    queryFn: async ({ pageParam }) =>
      getPosts({
        limit: 2,
        cursor: pageParam,
        orderBy: sort.value as 'asc' | 'desc',
        organizations: [org],
      }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && postsQuery.hasNextPage) {
            postsQuery.fetchNextPage()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (loadMoreBtnRef.current) {
      observer.observe(loadMoreBtnRef.current)
    }

    return () => observer.disconnect()
  }, [postsQuery])

  async function handleCancelRequest() {
    if (!session) return
    setIsCancelling(true)
    try {
      await cancelRequest({ session, org })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.refetchQueries({
        queryKey: ['member-requests', org],
      })
      toast.success('Request cancelled.')
    } catch {
      toast.error('Failed to cancel request.')
    } finally {
      setIsCancelling(false)
    }
  }

  async function handleRequestJoin() {
    if (!session) return
    setIsRequesting(true)
    try {
      await requestJoin({ session, org, memo: '' })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.refetchQueries({
        queryKey: ['member-requests', org],
      })
      toast.success(`Request to join ${org} has been sent.`)
    } catch {
      toast.error('Failed to send join request.')
    } finally {
      setIsRequesting(false)
    }
  }

  async function onSubmit(data: OrgPostSchema) {
    if (!actor) {
      toast.error('You must be logged in to create a post')
      return
    }

    try {
      if (data.recognize && data.badges?.length && data.recipientAccount) {
        const badgeActions = data.badges.map((badge) => ({
          session: session!,
          badge_symbol: badge,
          amount: 1,
          to: data.recipientAccount!,
          memo: data.content,
        }))
        await sendMultiBadge(badgeActions)

        await createPost({
          actor,
          content: data.content,
          badgeSymbol: data.badges,
          mention: [data.recipientAccount],
          organization: org,
        })
      } else {
        await createPost({
          actor,
          content: data.content,
          organization: org,
        })
      }

      reset()
      toast('Recognition published!')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    } catch {
      toast.error('Failed to publish recognition')
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
                ipfsImage
                  ? `${IPFS_IMAGE_SOURCE}${ipfsImage}`
                  : undefined
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
                  <Link href="/admin/organization">
                    Manage Organization
                  </Link>
                </Button>
              )}
              {isAuthenticated &&
                actor !== org &&
                (hasPendingRequest ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled={isCancelling}
                    onClick={handleCancelRequest}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Request'}
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
                ))}
            </div>
          </>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-title-2 mb-4 text-white">
          About Organization
        </h2>
        {orgQuery.isLoading && (
          <div className="animate-pulse">
            <div className="bg-gray-2 h-4 w-64 rounded-full" />
          </div>
        )}
        {orgData && (
          <div className="space-y-4">
            {createdAt && (
              <p className="text-body-2 text-gray-3">
                Created{' '}
                {format(new Date(createdAt * 1000), 'MMMM d, yyyy')}
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

      {/* Tab bar */}
      <div className="border-gray-2 flex gap-4 border-b">
        <button
          type="button"
          data-state={activeTab === 'stream' ? 'active' : 'idle'}
          className={tabClass}
          onClick={() => setActiveTab('stream')}
        >
          <MdOutlineDynamicFeed className="size-5" />
          Stream
        </button>
        <button
          type="button"
          data-state={activeTab === 'members' ? 'active' : 'idle'}
          className={tabClass}
          onClick={() => setActiveTab('members')}
        >
          <MdOutlinePeople className="size-5" />
          Members
        </button>
      </div>

      {/* Stream tab */}
      {activeTab === 'stream' && (
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-end">
            <DropdownRoot label={sort.description} align="end">
              {sortList.map((item) => (
                <DropdownItem
                  key={item.value}
                  isSelected={sort.value === item.value}
                  onClick={() => setSort(item)}
                >
                  {item.description}
                </DropdownItem>
              ))}
            </DropdownRoot>
          </div>

          {isAuthenticated && isMember && (
            <>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-gray-1 border-gray-2 rounded-2xl border p-4">
                  <label>
                    <textarea
                      {...register('content')}
                      placeholder="What do you consider is worth recognition?"
                      className="text-body-1 placeholder:text-gray-3 mb-6 block min-h-20 w-full resize-none outline-none"
                      rows={4}
                    />
                  </label>

                  <AnimatePresence>
                    {recognizeWatched && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-gray-2 space-y-4 border-t pt-4 pb-6">
                          <div>
                            <span className="text-body-2 mb-1 block font-medium text-white">
                              Member
                            </span>
                            <Controller
                              name="recipientAccount"
                              control={control}
                              render={({ field }) => (
                                <Combobox
                                  title="Search members"
                                  closeOnSelect
                                  triggerContent={
                                    field.value ? (
                                      <div
                                        className="border-gray-2 bg-gray-2 inline-flex h-7 items-center gap-2 rounded-full border py-1 pr-1 pl-2"
                                        onClick={(e) =>
                                          e.stopPropagation()
                                        }
                                      >
                                        <Avatar size="xs">
                                          {field.value
                                            .slice(0, 2)
                                            .toUpperCase()}
                                        </Avatar>
                                        <span className="text-body-2 font-medium text-white">
                                          {field.value}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            field.onChange('')
                                          }}
                                          className="text-gray-3 hover:text-white p-0.5"
                                        >
                                          <MdClose className="size-4" />
                                        </button>
                                      </div>
                                    ) : null
                                  }
                                  filter={(value, search) => {
                                    if (
                                      value
                                        .toLowerCase()
                                        .includes(
                                          search.toLowerCase()
                                        )
                                    )
                                      return 1
                                    return 0
                                  }}
                                >
                                  <ComboboxEmpty />
                                  {filteredMembers.map((member) => (
                                    <ComboboxItem
                                      key={member.account}
                                      value={member.account}
                                      onSelect={(value) => {
                                        field.onChange(
                                          field.value === value
                                            ? ''
                                            : value
                                        )
                                      }}
                                      checked={
                                        field.value ===
                                        member.account
                                      }
                                    >
                                      <span className="flex items-center gap-2">
                                        <Avatar size="xs">
                                          {member.account
                                            .slice(0, 2)
                                            .toUpperCase()}
                                        </Avatar>
                                        {member.account}
                                      </span>
                                    </ComboboxItem>
                                  ))}
                                </Combobox>
                              )}
                            />
                          </div>

                          <div>
                            <span className="text-body-2 mb-1 block font-medium text-white">
                              Badges
                            </span>
                            <Controller
                              name="badges"
                              control={control}
                              render={({ field }) => (
                                <InputBadges
                                  value={field.value}
                                  onChange={field.onChange}
                                  scope={org}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2">
                    <label className="border-gray-2 hover:border-gray-3 flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 transition-colors">
                      <input
                        type="checkbox"
                        checked={recognizeWatched}
                        onChange={(e) => {
                          setValue('recognize', e.target.checked)
                          if (!e.target.checked) {
                            setValue('recipientAccount', '')
                            setValue('badges', [])
                          }
                        }}
                        className="sr-only"
                      />
                      <span
                        data-checked={recognizeWatched}
                        className="border-gray-3 flex size-4 items-center justify-center rounded border data-[checked=true]:border-white data-[checked=true]:bg-white"
                      >
                        {recognizeWatched && (
                          <svg
                            viewBox="0 0 12 12"
                            className="size-3 text-black"
                          >
                            <path
                              d="M10 3L4.5 8.5 2 6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="text-body-2 text-nowrap font-medium text-white">
                        Recognize
                      </span>
                    </label>

                    <div className="ml-auto">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={!canSubmit}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
              <hr className="border-gray-2 border-t" />
            </>
          )}

          {postsQuery.isSuccess &&
            postsQuery.data.pages?.map((page) =>
              page.posts?.map((post) => (
                <PostItem
                  key={post.id}
                  id={post.id}
                  actor={post.user.actor}
                  avatarIpfs={post.user.avatarIpfs}
                  createdAt={post.createdAt}
                  badgeSymbol={post.badgeSymbol}
                  content={post.content}
                  mentions={post.mention.map(
                    (item) => item.user.actor
                  )}
                  organization={post.organization}
                >
                  {post.children.map((comment) => (
                    <PostItemComment
                      key={comment.id}
                      actor={comment.user.actor}
                      avatarIpfs={comment.user.avatarIpfs}
                      createdAt={comment.createdAt}
                      content={comment.content}
                    />
                  ))}
                </PostItem>
              ))
            )}

          {postsQuery.isSuccess && (
            <div className="flex items-center justify-center">
              {postsQuery.data.pages[0].posts?.length === 0 ? (
                <p className="text-body-2 text-gray-3 py-14">
                  No posts available. Be the first to create one!
                </p>
              ) : (
                <Button
                  ref={loadMoreBtnRef}
                  variant="secondary"
                  onClick={() => postsQuery.fetchNextPage()}
                  disabled={
                    !postsQuery.hasNextPage ||
                    postsQuery.isFetchingNextPage ||
                    postsQuery.isFetching
                  }
                >
                  {postsQuery.isFetchingNextPage
                    ? 'Loading more...'
                    : postsQuery.hasNextPage
                      ? 'Load Newer'
                      : postsQuery.isFetching
                        ? 'Loading...'
                        : 'Nothing more to load'}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <section className="py-4">
          {membersQuery.isLoading && (
            <TableSkeleton columns={2} rows={4} />
          )}
          {membersQuery.isSuccess &&
            membersQuery.data.rows.length === 0 && (
              <p className="text-body-2 text-gray-3">
                No members yet.
              </p>
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
                        {format(
                          new Date(row.joined_at),
                          'EEE d MMM yyyy'
                        )}
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
      )}
    </div>
  )
}
