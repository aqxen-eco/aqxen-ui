'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import { Children, useState } from 'react'
import { useForm } from 'react-hook-form'
import { MdMoreHoriz, MdWorkspacePremium } from 'react-icons/md'
import { z } from 'zod'

import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { useChain } from '@/contexts/chain'

import { createPost } from './actions'
// import { BadgeImage } from '@/components/ui/badge-image'
// import { Tooltip } from '@/components/ui/tooltip'

type PostItemProps = {
  id: string
  actor: string
  createdAt: Date
  content: string
  children: React.ReactNode
}

const commentSchema = z.object({
  content: z.string().nonempty('Comment content is required'),
})

type CommentSchema = z.infer<typeof commentSchema>

export function PostItem({
  id,
  actor,
  createdAt,
  content,
  children,
}: PostItemProps) {
  const [showRecognize, setShowRecognize] = useState(false)
  const [showMore, setShowMore] = useState(() => {
    return Children.count(children) > 1
  })

  const { actor: currentActor } = useChain()

  const { register, handleSubmit, watch, reset } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
  })

  const queryClient = useQueryClient()

  const contentWatched = watch('content')

  async function onSubmit({ content }: CommentSchema) {
    createPost({
      parentId: id,
      actor: currentActor!,
      content,
    })

    reset()
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    setShowRecognize(false)
  }

  return (
    <Box className="before:bg-gray-2 after:bg-gray-2 relative p-0 before:absolute before:top-4 before:left-10 before:h-[calc(100%-2rem)] before:w-0.5 before:content-[''] after:absolute after:bottom-4 after:left-9.25 after:size-2 after:rounded-full after:content-[''] md:p-4 md:before:top-8 md:before:left-14 md:before:h-[calc(100%-4rem)] md:after:bottom-8 md:after:left-13.25">
      <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
        <Avatar size="md" className="ring-gray-1 relative z-10 ring-8">
          {actor.slice(0, 2)}
        </Avatar>
        <div className="max-md:space-y-2">
          <div className="flex flex-wrap items-center justify-between max-md:space-y-2">
            <p className="text-body-2 text-white">
              {actor}
              <span className="text-gray-3">
                {' '}
                • {format(new Date(createdAt), 'EEE d MMM')}
              </span>
            </p>
            <div className="text-gray-3 flex gap-0.5">
              <MdWorkspacePremium className="size-6" />
              <span className="text-body-2">50</span>
            </div>
          </div>
          {/* <div className="flex flex-wrap gap-1">
            {[2, 4, 2, 1, 1].map((value, index) => (
              <Tooltip
                key={index}
                className="text-gray-3 flex gap-0.5 p-1.5"
                content={
                  <>
                    <MdWorkspacePremium className="size-6" />
                    <span className="text-body-2">3</span>
                  </>
                }
              >
                <div className="flex min-w-16 gap-2">
                  <BadgeImage src="" size="xs" />
                  <span className="text-body-2 text-white">{value}</span>
                </div>
              </Tooltip>
            ))}
          </div> */}
          <p className="text-body-2 text-gray-3">{content}</p>
          <AnimatePresence>
            {!showRecognize && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="secondary"
                  className="mt-2"
                  onClick={() => setShowRecognize(true)}
                >
                  +1 recognize
                </Button>
              </motion.div>
            )}
            {showRecognize && (
              <motion.form
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2 }}
              >
                <label className="bg-gray-1 border-gray-2 mt-2 block rounded-xl border p-4">
                  <textarea
                    {...register('content')}
                    placeholder="Recognize your colleague for their hard work and dedication."
                    className="text-body-2 placeholder:text-gray-3 block field-sizing-content w-full resize-none outline-none"
                    rows={1}
                  />
                </label>
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="secondary"
                    className="mr-2"
                    onClick={() => setShowRecognize(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!contentWatched || contentWatched.length === 0}
                  >
                    Post
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div
        data-comments={showMore ? 'one' : 'all'}
        className="[&[data-comments=all]>*]:grid [&[data-comments=one]>:not(:first-child)]:hidden"
      >
        {children}
      </div>
      {showMore && (
        <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
          <div className="border-gray-2 bg-gray-1 ring-gray-1 relative z-10 flex size-12 items-center justify-center rounded-full border ring-8">
            <MdMoreHoriz className="size-6 text-white" />
          </div>
          <div className="flex items-center justify-start">
            <Button variant="secondary" onClick={() => setShowMore(false)}>
              Show More
            </Button>
          </div>
        </div>
      )}
    </Box>
  )
}

type PostItemCommentProps = {
  actor: string
  createdAt: Date
  content: string
}

export function PostItemComment({
  actor,
  createdAt,
  content,
}: PostItemCommentProps) {
  return (
    <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
      <Avatar size="md" className="ring-gray-1 relative z-10 ring-8">
        {actor.slice(0, 2)}
      </Avatar>
      <div className="max-md:space-y-2">
        <div className="flex flex-wrap items-center justify-between max-md:space-y-2">
          <div className="flex gap-2">
            <p className="text-body-2 max-w-full text-white">{actor}</p>
            {/* <Avatar size="xs">AZ</Avatar>
            <span className="text-body-2 text-gray-3">Responsibility</span> */}
            <span className="text-gray-3">
              {' '}
              • {format(new Date(createdAt), 'EEE d MMM')}
            </span>
          </div>
          <div className="text-gray-3 flex gap-0.5">
            <MdWorkspacePremium className="size-6" />
            <span className="text-body-2">50</span>
          </div>
        </div>
        <p className="text-body-2 text-gray-3">{content}</p>
      </div>
    </div>
  )
}
