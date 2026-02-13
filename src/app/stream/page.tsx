'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { createPost, getPosts } from '@/app/feed/actions'
import { PostItem, PostItemComment } from '@/app/feed/post-item'
import { Button } from '@/components/ui/button'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
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

const postSchema = z.object({
  content: z.string().nonempty('Post content is required'),
})

type PostSchema = z.infer<typeof postSchema>

export default function Stream() {
  const { isAuthenticated, actor, login } = useChain()

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
  const [sort, setSort] = useState<Record<string, string>>(sortList[0])
  const loadMoreBtnRef = useRef(null)

  const { register, handleSubmit, watch, reset } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  })

  const queryClient = useQueryClient()

  const query = useInfiniteQuery({
    queryKey: ['posts', sort.value],
    queryFn: async ({ pageParam }) =>
      getPosts({
        limit: 2,
        cursor: pageParam,
        orderBy: sort.value as 'asc' | 'desc',
      }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
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

  const contentWatched = watch('content')

  async function onSubmit({ content }: PostSchema) {
    if (!actor) {
      toast.error('You must be logged in to create a post')
      return
    }

    try {
      await createPost({
        actor: actor!,
        content,
      })
      reset()
      toast('Recognition published!')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    } catch {
      toast.error('Failed to publish recognition')
    }
  }

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
      <div className="space-y-4">
        {actor && (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="bg-gray-1 border-gray-2 block space-y-4 rounded-2xl border p-4">
                <textarea
                  {...register('content')}
                  placeholder="What do you consider is worth recognition?"
                  className="text-body-1 placeholder:text-gray-3 block field-sizing-content w-full resize-none outline-none"
                  rows={1}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!contentWatched || contentWatched.length === 0}
                  >
                    Post
                  </Button>
                </div>
              </label>
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
