'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { postBeam } from '@/api/chain/beams/post-beam'
import { announce } from '@/api/chain/organization/announce'
import {
  createAnnouncement,
  createPost,
  getPosts,
} from '@/app/feed/actions'
import { PostItem, PostItemComment } from '@/app/feed/post-item'
import { getUserOrganizations } from '@/app/profile/[user]/functions'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { Select, SelectItem } from '@/components/ui/select'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

const postSchema = z.object({
  content: z.string().nonempty('Post content is required'),
  organization: z.string().nonempty('Select an organization'),
})

type PostSchema = z.infer<typeof postSchema>

const tabClass =
  'text-body-2 text-gray-3 relative flex shrink-0 cursor-pointer items-center gap-2 pb-4 font-medium data-[state=active]:text-white data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:left-0 data-[state=active]:before:h-0.5 data-[state=active]:before:w-full data-[state=active]:before:bg-white'

export default function Stream() {
  const { isAuthenticated, isInitializing, actor, login } = useChain()
  const t = useTranslations('stream')

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
            {t('heroHeading')}
          </h1>
          <p className="text-body-1 text-gray-3">
            {t('heroDescription')}
          </p>
        </div>
      </header>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            {t('noiseTitle')}
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            {t('noiseDescription')}
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6 md:grid md:grid-cols-3 md:gap-8">
        <div className="col-span-1">
          <h2 className="text-display-2 max-md:text-title-1 text-white">
            {t('whatYoullFindTitle')}
          </h2>
        </div>
        <div className="col-span-2">
          <p className="text-body-1 text-gray-3">
            {t('whatYoullFind1')}
          </p>
          <p className="text-body-1 text-gray-3">
            {t('whatYoullFind2')}
          </p>
          <p className="text-body-1 text-gray-3">
            {t('whatYoullFind3')}
          </p>
        </div>
      </section>
      <section className="max-w-container-lg mx-auto px-4 py-16 max-md:space-y-6">
        <div className="bg-gray-1 border-gray-2 w-full space-y-4 rounded-2xl border p-4 text-center md:py-16">
          <h2 className="text-display-2 max-md:text-title-1 max-w-container-md mx-auto text-white">
            {t('ctaHeading')}
          </h2>
          <Button onClick={login} variant="primary" size="lg">
            {t('ctaButton')}
          </Button>
        </div>
      </section>
    </>
  )
}

function AuthenticatedStream({ actor }: { actor: string | undefined }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session } = useChain()
  const {
    hasOrganization,
    name: ownedOrgName,
    displayName: ownedOrgDisplayName,
    ipfs: ownedOrgIpfs,
  } = useOrganization()
  const t = useTranslations('stream')

  const sortList = useMemo(
    () => [
      { description: t('sortLatest'), value: 'desc' },
      { description: t('sortOldest'), value: 'asc' },
    ],
    [t],
  )

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
  const isOwnedOrgTab = hasOrganization && activeTab === ownedOrgName

  const { control, register, handleSubmit, watch, reset, setValue } =
    useForm<PostSchema>({
      resolver: zodResolver(postSchema),
      defaultValues: {
        content: '',
        organization: '',
      },
    })

  const queryClient = useQueryClient()

  const { data: userOrgs } = useQuery({
    queryKey: ['user-organizations', actor],
    queryFn: () => getUserOrganizations({ user: actor! }),
    enabled: !!actor,
  })

  const ownedOrgInMemberList = useMemo(
    () => userOrgs?.some((org) => org.org === ownedOrgName),
    [userOrgs, ownedOrgName]
  )

  const allOrgNames = useMemo(() => {
    const names = userOrgs?.map((org) => org.org) ?? []
    if (hasOrganization && !names.includes(ownedOrgName)) {
      names.push(ownedOrgName)
    }
    return names
  }, [userOrgs, hasOrganization, ownedOrgName])

  useEffect(() => {
    if (isOrgTab) {
      setValue('organization', activeTab)
    } else {
      setValue('organization', '')
    }
  }, [activeTab, isOrgTab, setValue])

  const selectedOrg = watch('organization')
  const contentWatched = watch('content')

  const queryParams = useMemo(() => {
    if (activeTab === 'my-posts') {
      return { actor }
    }
    if (activeTab === 'all') {
      return allOrgNames.length > 0
        ? { organizations: allOrgNames }
        : undefined
    }
    return { organizations: [activeTab] }
  }, [activeTab, actor, allOrgNames])

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
      toast.error(t('loginRequiredPost'))
      return
    }

    try {
      if (session && data.organization) {
        await postBeam({
          session,
          org: data.organization,
          from: actor,
          post_content: data.content,
          parsed_content: data.content,
        })
      }

      await createPost({
        content: data.content,
        organization: data.organization,
      })

      reset()
      if (isOrgTab) {
        setValue('organization', activeTab)
      }
      toast(t('postPublished'))
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    } catch {
      toast.error(t('postFailed'))
    }
  }

  async function onSubmitAnnouncement(data: PostSchema) {
    if (!actor || !session) {
      toast.error(t('loginRequiredAnnouncement'))
      return
    }

    try {
      const result = await announce({
        session,
        org: ownedOrgName,
        content: data.content,
      })

      let onChainPostId: string | undefined
      const logAction = result?.response?.processed?.action_traces
        ?.flatMap(
          (tr: {
            inline_traces?: {
              act?: {
                name?: string
                data?: { post_id?: number }
              }
            }[]
          }) => tr.inline_traces ?? []
        )
        ?.find(
          (tr: { act?: { name?: string } }) =>
            tr.act?.name === 'logannounce'
        )
      if (logAction?.act?.data?.post_id != null) {
        onChainPostId = String(logAction.act.data.post_id)
      }

      await createAnnouncement({
        content: data.content,
        organization: ownedOrgName,
        onChainPostId,
      })
      reset()
      toast(t('announcementPublished'))
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    } catch {
      toast.error(t('announcementFailed'))
    }
  }

  const canSubmit = !!contentWatched && !!selectedOrg

  return (
    <div className="max-w-container-md mx-auto space-y-4 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-title-1 text-white">{t('heading')}</h1>
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
          {t('tabAll')}
        </button>
        <button
          type="button"
          data-state={activeTab === 'my-posts' ? 'active' : 'idle'}
          className={tabClass}
          onClick={() => handleTabChange('my-posts')}
        >
          {t('tabMyPosts')}
        </button>
        {hasOrganization && !ownedOrgInMemberList && (
          <button
            type="button"
            data-state={
              activeTab === ownedOrgName ? 'active' : 'idle'
            }
            className={tabClass}
            onClick={() => handleTabChange(ownedOrgName)}
          >
            <Avatar
              size="xs"
              src={
                ownedOrgIpfs
                  ? `${IPFS_IMAGE_SOURCE}${ownedOrgIpfs}`
                  : undefined
              }
            >
              {(ownedOrgDisplayName || ownedOrgName)
                .charAt(0)
                .toUpperCase()}
            </Avatar>
            {ownedOrgDisplayName || ownedOrgName}
          </button>
        )}
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
      </div>

      <div className="space-y-4">
        {actor && isOwnedOrgTab && (
          <>
            <form onSubmit={handleSubmit(onSubmitAnnouncement)}>
              <div className="bg-gray-1 border-gray-2 rounded-2xl border p-4">
                <label>
                  <textarea
                    {...register('content')}
                    placeholder={t('announcePlaceholder')}
                    className="text-body-1 placeholder:text-gray-3 mb-6 block min-h-20 w-full resize-none outline-none"
                    rows={4}
                  />
                </label>

                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!contentWatched}
                  >
                    {t('announceButton')}
                  </Button>
                </div>
              </div>
            </form>
            <hr className="border-gray-2 border-t" />
          </>
        )}
        {actor && !isOwnedOrgTab && (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-gray-1 border-gray-2 rounded-2xl border p-4">
                <label>
                  <textarea
                    {...register('content')}
                    placeholder={t('postPlaceholder')}
                    className="text-body-1 placeholder:text-gray-3 mb-6 block min-h-20 w-full resize-none outline-none"
                    rows={4}
                  />
                </label>

                <div className="flex items-center gap-2">
                  <div className="ml-auto flex items-center gap-2">
                    {showOrgSelector && (
                      <Controller
                        name="organization"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label={t('orgSelectLabel')}
                            placeholder={t('orgSelectPlaceholder')}
                            value={field.value}
                            onValueChange={(value) => {
                              if (
                                hasOrganization &&
                                value === ownedOrgName
                              ) {
                                handleTabChange(ownedOrgName)
                                return
                              }
                              field.onChange(value)
                            }}
                          >
                            {hasOrganization &&
                              !ownedOrgInMemberList && (
                                <SelectItem value={ownedOrgName}>
                                  <span className="flex items-center gap-2">
                                    <Avatar
                                      size="xs"
                                      src={
                                        ownedOrgIpfs
                                          ? `${IPFS_IMAGE_SOURCE}${ownedOrgIpfs}`
                                          : undefined
                                      }
                                    >
                                      {(
                                        ownedOrgDisplayName ||
                                        ownedOrgName
                                      ).charAt(0)}
                                    </Avatar>
                                    {ownedOrgDisplayName ||
                                      ownedOrgName}
                                  </span>
                                </SelectItem>
                              )}
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
                      {t('postButton')}
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
                totalScore={post.totalScore}
                isAnnouncement={post.isAnnouncement}
                beamGives={[
                  ...post.beamGives,
                  ...post.children.flatMap((c) => c.beamGives),
                ]}
              >
                {post.children.map((comment) => (
                  <PostItemComment
                    key={comment.id}
                    actor={comment.user.actor}
                    avatarIpfs={comment.user.avatarIpfs}
                    createdAt={comment.createdAt}
                    content={comment.content}
                    badgeSymbol={comment.badgeSymbol}
                    organization={comment.organization}
                    totalScore={comment.totalScore}
                    beamGives={comment.beamGives}
                    hideScore={post.isAnnouncement}
                  />
                ))}
              </PostItem>
            ))
          )}

        {query.isSuccess && (
          <div className="flex items-center justify-center">
            {query.data.pages[0].posts?.length === 0 ? (
              <p className="text-body-2 text-gray-3 py-14">
                {t('noPostsMessage')}
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
                  ? t('loadingMore')
                  : query.hasNextPage
                    ? t('loadNewer')
                    : query.isFetching
                      ? t('loading')
                      : t('nothingMore')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
