'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { useChain } from '@/contexts/chain'

import { createPost, getPosts } from './actions'
import { PostItem, PostItemComment } from './post-item'

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

export default function FeedPage() {
  const [sort, setSort] = useState<Record<string, string>>(sortList[0])
  // const [filter, setFilter] = useState('myRecognitions')
  const { actor } = useChain()

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
        <h1 className="text-title-1 text-white">Feed</h1>
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
      {/* <div className="border-gray-2 overflow-x-auto border-b py-2">
        <ul className="flex gap-2">
          <li
            data-state={filter === 'myRecognitions' ? 'active' : 'idle'}
            className="relative data-[state=active]:before:absolute data-[state=active]:before:-bottom-2 data-[state=active]:before:h-px data-[state=active]:before:w-full data-[state=active]:before:bg-white"
          >
            <Button
              onClick={() => setFilter('myRecognitions')}
              variant={filter === 'myRecognitions' ? 'link' : 'default'}
            >
              My Recognitions
            </Button>
          </li>
          <li
            data-state={filter === 'teamRecognitions' ? 'active' : 'idle'}
            className="relative data-[state=active]:before:absolute data-[state=active]:before:-bottom-2 data-[state=active]:before:h-px data-[state=active]:before:w-full data-[state=active]:before:bg-white"
          >
            <Button
              onClick={() => setFilter('teamRecognitions')}
              variant={filter === 'teamRecognitions' ? 'link' : 'default'}
            >
              Team Recognitions
            </Button>
          </li>
          <li
            data-state={
              filter === 'organizationRecognitions' ? 'active' : 'idle'
            }
            className="relative data-[state=active]:before:absolute data-[state=active]:before:-bottom-2 data-[state=active]:before:h-px data-[state=active]:before:w-full data-[state=active]:before:bg-white"
          >
            <Button
              onClick={() => setFilter('organizationRecognitions')}
              variant={
                filter === 'organizationRecognitions' ? 'link' : 'default'
              }
            >
              Organization Recognitions
            </Button>
          </li>
        </ul>
      </div> */}
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
                organization={post.organization}
                totalScore={post.totalScore}
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
