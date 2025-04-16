'use server'

import { prisma } from '@/prisma-client'

type CreatePostProps = {
  actor: string
  content: string
}

export async function createPost({ actor, content }: CreatePostProps) {
  try {
    const user = await prisma.user.upsert({
      where: { actor },
      update: {},
      create: {
        actor,
      },
    })

    const post = await prisma.post.create({
      data: {
        content,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        user: true,
      },
    })

    return {
      success: true,
      post,
    }
  } catch (error) {
    console.error('Error creating post:', error)
    return {
      success: false,
      error: 'Failed to create post',
    }
  }
}

type CreateCommentProps = {
  postId: string
  actor: string
  content: string
}

export async function createComment({
  postId,
  actor,
  content,
}: CreateCommentProps) {
  try {
    const user = await prisma.user.upsert({
      where: { actor },
      update: {},
      create: {
        actor,
      },
    })

    const comment = await prisma.comment.create({
      data: {
        content,
        post: {
          connect: {
            id: postId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        user: true,
      },
    })

    return {
      success: true,
      comment,
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    return {
      success: false,
      error: 'Failed to create comment',
    }
  }
}

type GetPostsProps = {
  cursor?: string
  limit: number
}

export async function getPosts({ cursor, limit }: GetPostsProps) {
  try {
    const posts = await prisma.post.findMany({
      take: limit,
      skip: cursor ? 1 : 0, // Skip the cursor if provided
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].id : null

    return {
      success: true,
      posts,
      nextCursor,
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return {
      success: false,
      error: 'Failed to fetch posts',
    }
  }
}
