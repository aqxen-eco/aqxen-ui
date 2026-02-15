'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { Children, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MdMoreHoriz, MdWorkspacePremium } from 'react-icons/md'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { listBadge } from '@/api/chain/badge/list-badge'
import { sendMultiBadge } from '@/api/chain/badge/send-multi-badge'
import { Avatar } from '@/components/ui/avatar'
import { BadgeImage } from '@/components/ui/badge-image'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { InputBadges } from '@/components/ui/input-badges'
import { Tooltip } from '@/components/ui/tooltip'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { useGetOrganization } from '@/hooks/query/use-get-organization'
import { listFormat } from '@/utils/intl-format'

import { createPost } from './actions'

type PostItemProps = {
  id: string
  actor: string
  avatarIpfs?: string | null
  createdAt: Date
  content: string
  badgeSymbol: string[]
  mentions?: string[]
  organization?: string | null
  children: React.ReactNode
}

const commentSchema = z.object({
  content: z.string().nonempty('Comment content is required'),
  badges: z.string().array().min(1, 'Select at least one badge'),
})

type CommentSchema = z.infer<typeof commentSchema>

export function PostItem({
  id,
  actor,
  avatarIpfs,
  createdAt,
  content,
  badgeSymbol,
  mentions,
  organization,
  children,
}: PostItemProps) {
  const [showRecognize, setShowRecognize] = useState(false)
  const { name } = useOrganization()

  const orgQuery = useGetOrganization(organization)
  const orgAvatar =
    orgQuery.data?.rows[0]?.offchain_lookup_data?.user.ipfs_image
  const orgDisplayName =
    orgQuery.data?.rows[0]?.onchain_lookup_data?.user.display_name
  const [showMore, setShowMore] = useState(() => {
    return Children.count(children) > 1
  })

  const query = useQuery({
    queryKey: ['badges', name],
    queryFn: async () => await listBadge({ scope: name }),
  })

  const { actor: currentActor, session } = useChain()

  const { control, register, handleSubmit, watch, reset } =
    useForm<CommentSchema>({
      resolver: zodResolver(commentSchema),
    })

  const queryClient = useQueryClient()

  const contentWatched = watch('content')
  const badgesWatched = watch('badges')

  async function onSubmit({ content, badges }: CommentSchema) {
    try {
      const data = badges.map((badge) => ({
        session: session!,
        badge_symbol: badge,
        amount: 1,
        to: actor,
        memo: content,
      }))

      await sendMultiBadge(data)

      await createPost({
        parentId: id,
        actor: currentActor!,
        content,
        badgeSymbol: badges,
        mention: [actor],
      })

      toast('Recognition published!')
      reset()
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setShowRecognize(false)
    } catch {
      toast.error('Failed to send badge')
    }
  }

  return (
    <Box className="before:bg-gray-2 after:bg-gray-2 relative p-0 before:absolute before:top-4 before:left-10 before:h-[calc(100%-2rem)] before:w-0.5 before:content-[''] after:absolute after:bottom-4 after:left-9.25 after:size-2 after:rounded-full after:content-[''] md:p-4 md:before:top-8 md:before:left-14 md:before:h-[calc(100%-4rem)] md:after:bottom-8 md:after:left-13.25">
      <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
        <div className="relative">
          <Avatar
            size="md"
            className="ring-gray-1 relative z-10 ring-8"
            src={avatarIpfs ? IPFS_IMAGE_SOURCE + avatarIpfs : undefined}
          >
            {actor.slice(0, 2)}
          </Avatar>
          {organization && orgAvatar && (
            <Tooltip content={orgDisplayName || organization}>
              <button className="absolute -right-1 -bottom-1 z-20">
                <Avatar
                  size="xs"
                  src={IPFS_IMAGE_SOURCE + orgAvatar}
                  className="ring-gray-1 ring-2"
                >
                  {organization.slice(0, 2)}
                </Avatar>
              </button>
            </Tooltip>
          )}
        </div>
        <div className="max-md:space-y-2">
          <div className="flex flex-wrap items-center justify-between max-md:space-y-2">
            <p className="text-body-2 text-white">
              <Link href={`/profile/${actor}`} className="hover:underline">
                {actor}
              </Link>
              {mentions && mentions.length > 0 && (
                <>
                  {' '}
                  <span className="text-gray-3">recognize</span>{' '}
                  {listFormat.formatToParts(mentions).map(({ type, value }) =>
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
                • {format(new Date(createdAt), 'EEE d MMM')}
              </span>
            </p>
            <div className="text-gray-3 flex gap-0.5">
              <MdWorkspacePremium className="size-6" />
              <span className="text-body-2">50</span>
            </div>
          </div>
          {badgeSymbol.length > 0 && (
            <div>
              {query.isSuccess &&
                query.data.rows.map(
                  (row) =>
                    badgeSymbol.includes(row.badge_symbol) && (
                      <Tooltip
                        key={row.badge_symbol}
                        content={row.onchain_lookup_data.user.display_name}
                      >
                        <Button square>
                          <BadgeImage
                            src={row.offchain_lookup_data.user.ipfs_image}
                            size="xs"
                          />
                        </Button>
                      </Tooltip>
                    )
                )}
            </div>
          )}
          <p className="text-body-2 text-gray-3">{content}</p>
          {currentActor && currentActor !== actor && (
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
                  className="border-gray-2 mt-4 space-y-4 border-t pt-4"
                >
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
                        />
                      )}
                    />
                  </div>
                  <div>
                    <span className="text-body-2 mb-1 block font-medium text-white">
                      Message
                    </span>
                    <label className="bg-gray-1 border-gray-2 block rounded-xl border p-4">
                      <textarea
                        {...register('content')}
                        placeholder="Recognize your colleague for their hard work and dedication."
                        className="text-body-2 placeholder:text-gray-3 block field-sizing-content w-full resize-none outline-none"
                        rows={1}
                      />
                    </label>
                  </div>
                  <div className="flex justify-end">
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
                      disabled={
                        !contentWatched ||
                        contentWatched.length === 0 ||
                        !badgesWatched ||
                        badgesWatched.length === 0
                      }
                    >
                      Post
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}
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
  avatarIpfs?: string | null
  createdAt: Date
  content: string
}

export function PostItemComment({
  actor,
  avatarIpfs,
  createdAt,
  content,
}: PostItemCommentProps) {
  return (
    <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
      <Avatar
        size="md"
        className="ring-gray-1 relative z-10 ring-8"
        src={avatarIpfs ? IPFS_IMAGE_SOURCE + avatarIpfs : undefined}
      >
        {actor.slice(0, 2)}
      </Avatar>
      <div className="max-md:space-y-2">
        <div className="flex flex-wrap items-center justify-between max-md:space-y-2">
          <div className="flex gap-2">
            <p className="text-body-2 max-w-full text-white">
              <Link href={`/profile/${actor}`} className="hover:underline">
                {actor}
              </Link>
            </p>
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
