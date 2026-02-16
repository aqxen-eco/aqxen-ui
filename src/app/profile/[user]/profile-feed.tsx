'use client'

import { format } from 'date-fns'
import Link from 'next/link'

import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { listFormat } from '@/utils/intl-format'

type Post = {
  id: string
  content: string
  createdAt: Date
  user: {
    actor: string
    avatarIpfs: string | null
  }
  mention: {
    user: {
      actor: string
    }
  }[]
  children: {
    id: string
    content: string
    createdAt: Date
    user: {
      actor: string
      avatarIpfs: string | null
    }
  }[]
}

type ProfileFeedProps = {
  posts: Post[]
}

export function ProfileFeed({ posts }: ProfileFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="px-8 py-8 max-md:px-4">
        <p className="text-body-2 text-gray-3">No posts yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-8 py-8 max-md:px-4">
      {posts.map((post) => (
        <Box key={post.id} className="p-4">
          <div className="flex gap-3">
            <Avatar
              size="sm"
              src={
                post.user.avatarIpfs
                  ? IPFS_IMAGE_SOURCE + post.user.avatarIpfs
                  : undefined
              }
            >
              {post.user.actor.slice(0, 2)}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-body-2 text-white">
                <Link
                  href={`/profile/${post.user.actor}`}
                  className="font-medium hover:underline"
                >
                  {post.user.actor}
                </Link>
                {post.mention.length > 0 && (
                  <>
                    {' '}
                    <span className="text-gray-3">recognized</span>{' '}
                    {listFormat
                      .formatToParts(post.mention.map((m) => m.user.actor))
                      .map(({ type, value }) =>
                        type === 'element' ? (
                          <Link
                            key={value}
                            href={`/profile/${value}`}
                            className="hover:underline"
                          >
                            {value}
                          </Link>
                        ) : (
                          <span key={value} className="text-gray-3">
                            {value}
                          </span>
                        )
                      )}
                  </>
                )}
                <span className="text-gray-3">
                  {' '}
                  &bull; {format(new Date(post.createdAt), 'EEE d MMM')}
                </span>
              </p>
              <p className="text-body-2 text-gray-3 mt-1">{post.content}</p>
            </div>
          </div>
          {post.children.length > 0 && (
            <div className="border-gray-2 mt-4 space-y-3 border-t pt-4">
              {post.children.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar
                    size="xs"
                    src={
                      comment.user.avatarIpfs
                        ? IPFS_IMAGE_SOURCE + comment.user.avatarIpfs
                        : undefined
                    }
                  >
                    {comment.user.actor.slice(0, 2)}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-2 text-white">
                      <Link
                        href={`/profile/${comment.user.actor}`}
                        className="font-medium hover:underline"
                      >
                        {comment.user.actor}
                      </Link>
                      <span className="text-gray-3">
                        {' '}
                        &bull;{' '}
                        {format(new Date(comment.createdAt), 'EEE d MMM')}
                      </span>
                    </p>
                    <p className="text-body-2 text-gray-3 mt-0.5">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Box>
      ))}
    </div>
  )
}
