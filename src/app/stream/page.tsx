'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MdClose } from 'react-icons/md'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { sendMultiBadge } from '@/api/chain/badge/send-multi-badge'
import { listMembers } from '@/api/chain/organization/list-members'
import { createPost, getPosts } from '@/app/feed/actions'
import { PostItem, PostItemComment } from '@/app/feed/post-item'
import { getUserOrganizations } from '@/app/profile/[user]/functions'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxEmpty,
  ComboboxItem,
} from '@/components/ui/combobox'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { InputBadges } from '@/components/ui/input-badges'
import { Select, SelectItem } from '@/components/ui/select'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useChain } from '@/contexts/chain'

const sortList = [
  {
    description: 'Latest',
    value: 'desc',
  },
  {
    description: 'Oldest',
    value: 'asc',
  },
]

const postSchema = z
  .object({
    content: z.string().nonempty('Post content is required'),
    organization: z.string().nonempty('Select an organization'),
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

type PostSchema = z.infer<typeof postSchema>

const tabClass =
  'text-body-2 text-gray-3 relative flex shrink-0 cursor-pointer items-center gap-2 pb-4 font-medium data-[state=active]:text-white data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:left-0 data-[state=active]:before:h-0.5 data-[state=active]:before:w-full data-[state=active]:before:bg-white'

export default function Stream() {
  const { isAuthenticated, isInitializing, actor, login } = useChain()

  if (isInitializing) {
    return null
  }

  if (isAuthenticated) {
    return <AuthenticatedStream actor={actor} />
  }

  return (
    <>
      <header className="max-w-container-md relative mx-auto overflow-hidden px-4 py-16">
        <div className="space-y-6 md:py-32 md:text-center">
          <h1 className="text-display-1 max-md:text-display-2 text-white">
            Welcome to the AqXen Stream: Progress in Action
          </h1>
          <p className="text-body-1 text-gray-3">
            The first social activity stream focused purely on celebrating
            achievements and driving organizational success.
          </p>
        </div>
      </header>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            A Stream Free From Noise.
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            Unlike other platforms, the AqXen Stream is designed to be
            motivating, not distracting. You will only see posts aligned with
            your interests, validated with &apos;Beams&apos; from your
            colleagues, teammates, or fellow community member. All focused on
            positive steps toward shared goals.
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            What You&apos;ll Find Here
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            1. Real-Time Recognition: See who is making an impact, right now.
          </p>
          <p className="text-body-1 text-gray-3">
            2. Community Goals: Posts are tied to measurable objectives.
          </p>
          <p className="text-body-1 text-gray-3">
            3. Reputation Tally: Instantly see your Beams and reputation score
            grow.
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6">
        <div className="bg-gray-1 border-gray-2 w-full space-y-4 rounded-2xl border p-4 text-center md:py-16">
          <h2 className="text-display-2 max-md:text-title-1 max-w-container-md mx-auto text-white">
            Ready to See Real Progress?
          </h2>
          <Button onClick={login} variant="primary" size="lg">
            Log in to the AqXen Stream
          </Button>
        </div>
      </section>
    </>
  )
}

function AuthenticatedStream({ actor }: { actor: string | undefined }) {
  const { session } = useChain()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sort, setSort] = useState<Record<string, string>>(sortList[0])
  const [activeTab, setActiveTab] = useState<string>(
    () => searchParams.get('tab') || 'all'
  )
  const loadMoreBtnRef = useRef(null)

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab)
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'all') {
        params.delete('tab')
      } else {
        params.set('tab', tab)
      }
      const query = params.toString()
      router.replace(query ? `?${query}` : '/stream', { scroll: false })
    },
    [router, searchParams]
  )

  const showOrgSelector = activeTab === 'all' || activeTab === 'my-posts'
  const isOrgTab = !showOrgSelector

  const { control, register, handleSubmit, watch, reset, setValue } =
    useForm<PostSchema>({
      resolver: zodResolver(postSchema),
      defaultValues: {
        content: '',
        organization: '',
        recognize: false,
        recipientAccount: '',
        badges: [],
      },
    })

  const queryClient = useQueryClient()

  const { data: userOrgs } = useQuery({
    queryKey: ['user-organizations', actor],
    queryFn: () => getUserOrganizations({ user: actor! }),
    enabled: !!actor,
  })

  const userOrgNames = useMemo(
    () => userOrgs?.map((org) => org.org) ?? [],
    [userOrgs]
  )

  useEffect(() => {
    if (isOrgTab) {
      setValue('organization', activeTab)
    } else {
      setValue('organization', '')
    }
    setValue('recognize', false)
    setValue('recipientAccount', '')
    setValue('badges', [])
  }, [activeTab, isOrgTab, setValue])

  const selectedOrg = watch('organization')
  const contentWatched = watch('content')
  const recognizeWatched = watch('recognize')

  const membersQuery = useQuery({
    queryKey: ['members', selectedOrg],
    queryFn: () => listMembers({ scope: selectedOrg }),
    enabled: !!selectedOrg && recognizeWatched,
  })

  const filteredMembers = useMemo(
    () =>
      membersQuery.data?.rows.filter((m) => m.account !== actor) ?? [],
    [membersQuery.data, actor]
  )

  const queryParams = useMemo(() => {
    if (activeTab === 'my-posts') {
      return { actor }
    }
    if (activeTab === 'all') {
      return userOrgNames.length > 0
        ? { organizations: userOrgNames }
        : undefined
    }
    return { organizations: [activeTab] }
  }, [activeTab, actor, userOrgNames])

  const query = useInfiniteQuery({
    queryKey: ['posts', sort.value, activeTab, queryParams],
    queryFn: async ({ pageParam }) =>
      getPosts({
        limit: 2,
        cursor: pageParam,
        orderBy: sort.value as 'asc' | 'desc',
        ...queryParams,
      }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: activeTab === 'my-posts' || !!queryParams,
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && query.hasNextPage) {
            query.fetchNextPage()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (loadMoreBtnRef.current) {
      observer.observe(loadMoreBtnRef.current)
    }

    return () => observer.disconnect()
  }, [query])

  async function onSubmit(data: PostSchema) {
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
          organization: data.organization,
        })
      } else {
        await createPost({
          actor,
          content: data.content,
          organization: data.organization,
        })
      }

      reset()
      if (isOrgTab) {
        setValue('organization', activeTab)
      }
      toast('Recognition published!')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    } catch {
      toast.error('Failed to publish recognition')
    }
  }

  const recipientWatched = watch('recipientAccount')
  const badgesWatched = watch('badges')

  const canSubmit = (() => {
    if (!contentWatched || !selectedOrg) return false
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

  return (
    <div className="max-w-container-md mx-auto space-y-4 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-title-1 text-white">Stream</h1>
        <DropdownRoot label={sort.description} align="end">
          {sortList.map((item) => (
            <DropdownItem
              key={item.value}
              isSelected={sort.value === item.value}
              onClick={() => {
                setSort(item)
              }}
            >
              {item.description}
            </DropdownItem>
          ))}
        </DropdownRoot>
      </header>

      <div className="border-gray-2 -mx-4 flex gap-4 overflow-x-auto border-b px-4">
        <button
          type="button"
          data-state={activeTab === 'all' ? 'active' : 'idle'}
          className={tabClass}
          onClick={() => handleTabChange('all')}
        >
          All
        </button>
        {userOrgs?.map((org) => {
          const displayName =
            org.onchain_lookup_data?.user?.display_name || org.org
          const avatarSrc = org.offchain_lookup_data?.user?.ipfs_image
            ? `${IPFS_IMAGE_SOURCE}${org.offchain_lookup_data.user.ipfs_image}`
            : undefined
          return (
            <button
              key={org.org}
              type="button"
              data-state={activeTab === org.org ? 'active' : 'idle'}
              className={tabClass}
              onClick={() => handleTabChange(org.org)}
            >
              <Avatar size="xs" src={avatarSrc}>
                {displayName.charAt(0)}
              </Avatar>
              {displayName}
            </button>
          )
        })}
        <button
          type="button"
          data-state={activeTab === 'my-posts' ? 'active' : 'idle'}
          className={tabClass}
          onClick={() => handleTabChange('my-posts')}
        >
          My Posts
        </button>
      </div>

      <div className="space-y-4">
        {actor && (
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
                  {recognizeWatched && selectedOrg && (
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
                                      field.value === member.account
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
                                scope={selectedOrg}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2">
                  {selectedOrg && (
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
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {showOrgSelector && (
                      <Controller
                        name="organization"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Organization"
                            placeholder="Select org"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value)
                              setValue('recipientAccount', '')
                              setValue('badges', [])
                            }}
                          >
                            {userOrgs?.map((org) => {
                              const displayName =
                                org.onchain_lookup_data?.user
                                  ?.display_name || org.org
                              const avatarSrc =
                                org.offchain_lookup_data?.user?.ipfs_image
                                  ? `${IPFS_IMAGE_SOURCE}${org.offchain_lookup_data.user.ipfs_image}`
                                  : undefined
                              return (
                                <SelectItem
                                  key={org.org}
                                  value={org.org}
                                >
                                  <span className="flex items-center gap-2">
                                    <Avatar size="xs" src={avatarSrc}>
                                      {displayName.charAt(0)}
                                    </Avatar>
                                    {displayName}
                                  </span>
                                </SelectItem>
                              )
                            })}
                          </Select>
                        )}
                      />
                    )}
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
        {query.isSuccess &&
          query.data.pages?.map((page) =>
            page.posts?.map((post) => (
              <PostItem
                key={post.id}
                id={post.id}
                actor={post.user.actor}
                avatarIpfs={post.user.avatarIpfs}
                createdAt={post.createdAt}
                badgeSymbol={post.badgeSymbol}
                content={post.content}
                mentions={post.mention.map((item) => item.user.actor)}
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

        {query.isSuccess && (
          <div className="flex items-center justify-center">
            {query.data.pages[0].posts?.length === 0 ? (
              <p className="text-body-2 text-gray-3 py-14">
                No posts available. Be the first to create one!
              </p>
            ) : (
              <Button
                ref={loadMoreBtnRef}
                variant="secondary"
                onClick={() => query.fetchNextPage()}
                disabled={
                  !query.hasNextPage ||
                  query.isFetchingNextPage ||
                  query.isFetching
                }
              >
                {query.isFetchingNextPage
                  ? 'Loading more...'
                  : query.hasNextPage
                    ? 'Load Newer'
                    : query.isFetching
                      ? 'Loading...'
                      : 'Nothing more to load'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
