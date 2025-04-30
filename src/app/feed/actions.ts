'use server'

import { prisma } from '@/prisma-client'

type CreatePostProps = {
  actor: string
  content: string
  parentId?: string
}

export async function createPost({
  actor,
  content,
  parentId,
}: CreatePostProps) {
  try {
    const user = await prisma.user.upsert({
      where: { actor },
      update: {},
      create: {
        actor,
      },
    })

    let relatedPosts = {}
    if (parentId) {
      relatedPosts = {
        parent: {
          connect: {
            id: parentId,
          },
        },
      }
    }

    await prisma.post.create({
      data: {
        content,
        user: {
          connect: {
            id: user.id,
          },
        },
        ...relatedPosts,
      },
      include: {
        user: true,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error creating post:', error)
    return {
      success: false,
      error: 'Failed to create post',
    }
  }
}

type GetPostsProps = {
  cursor?: string
  limit: number
  orderBy: 'asc' | 'desc'
}

export async function getPosts({ cursor, limit, orderBy }: GetPostsProps) {
  try {
    const posts = await prisma.post.findMany({
      take: limit,
      skip: cursor ? 1 : 0, // Skip the cursor if provided
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        parentId: null, // Filters only posts that are not comments
      },
      include: {
        user: true,
        children: {
          include: {
            user: true, // Includes the data of the user who created the child posts
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: orderBy,
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
