'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Popover from '@radix-ui/react-popover'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Command } from 'cmdk'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { Children, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { MdClose, MdMoreHoriz, MdWorkspacePremium } from 'react-icons/md'
import { toast } from 'react-toastify'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { listBadge } from '@/api/chain/badge/list-badge'
import { sendMultiBadge } from '@/api/chain/badge/send-multi-badge'
import { listBeamTemplates } from '@/api/chain/beams/list-beam-templates'
import { Avatar } from '@/components/ui/avatar'
import { BadgeDetailModal } from '@/components/ui/badge-detail-modal'
import { BadgeImage } from '@/components/ui/badge-image'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
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

const recognizeSchema = z.object({
  content: z.string().nonempty('Comment content is required'),
  badges: z.string().array().min(1, 'Select at least one badge'),
})

type RecognizeSchema = z.infer<typeof recognizeSchema>

const commentSchema = z.object({
  content: z.string().nonempty('Comment content is required'),
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
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [addBadgeOpen, setAddBadgeOpen] = useState(false)
  const { name } = useOrganization()

  const orgQuery = useGetOrganization(organization)
  const orgAvatar =
    orgQuery.data?.rows[0]?.offchain_lookup_data?.user.ipfs_image
  const orgDisplayName =
    orgQuery.data?.rows[0]?.onchain_lookup_data?.user.display_name
  const [showMore, setShowMore] = useState(() => {
    return Children.count(children) > 1
  })

  const badgeScope = organization || name

  const query = useQuery({
    queryKey: ['badges', badgeScope],
    queryFn: async () => await listBadge({ scope: badgeScope }),
    enabled: !!badgeScope,
  })

  const beamTemplatesQuery = useQuery({
    queryKey: ['beam-templates'],
    queryFn: listBeamTemplates,
  })

  const badgeRows = query.data?.rows
  const beamTemplates = beamTemplatesQuery.data

  const { beamBadges, customBadges } = useMemo(() => {
    if (!badgeRows) {
      return { beamBadges: [], customBadges: [] }
    }

    if (!beamTemplates) {
      return { beamBadges: [], customBadges: badgeRows }
    }

    const templateNames = new Set(
      beamTemplates.map((t) => t.display_name)
    )
    const trackingMetrics = ['Giving', 'Rep', 'Uniqueness']

    const beams: typeof badgeRows = []
    const custom: typeof badgeRows = []

    for (const badge of badgeRows) {
      const displayName =
        badge.onchain_lookup_data.user.display_name

      if (templateNames.has(displayName)) {
        beams.push(badge)
      } else {
        const isTracking = trackingMetrics.some((metric) => {
          if (!displayName.endsWith(` ${metric}`)) return false
          const beamName = displayName.slice(
            0,
            -(metric.length + 1)
          )
          return templateNames.has(beamName)
        })

        if (!isTracking) {
          custom.push(badge)
        }
      }
    }

    return { beamBadges: beams, customBadges: custom }
  }, [badgeRows, beamTemplates])

  const { actor: currentActor, session } = useChain()

  const isOwnPost = currentActor === actor

  const recognizeForm = useForm<RecognizeSchema>({
    resolver: zodResolver(recognizeSchema),
  })

  const commentForm = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
  })

  const queryClient = useQueryClient()

  const recognizeContent = recognizeForm.watch('content')
  const badgesWatched = recognizeForm.watch('badges')
  const commentContent = commentForm.watch('content')

  async function onRecognize({ content, badges }: RecognizeSchema) {
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
      recognizeForm.reset()
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setShowRecognize(false)
    } catch {
      toast.error('Failed to send badge')
    }
  }

  async function onComment({ content }: CommentSchema) {
    try {
      await createPost({
        parentId: id,
        actor: currentActor!,
        content,
      })

      toast('Comment published!')
      commentForm.reset()
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setShowRecognize(false)
    } catch {
      toast.error('Failed to post comment')
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
              {organization && orgDisplayName && (
                <>
                  <span className="text-gray-3"> • </span>
                  <Link
                    href={`/organizations/${organization}`}
                    className="text-gray-3 hover:text-white hover:underline"
                  >
                    {orgDisplayName}
                  </Link>
                </>
              )}
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
                        <Button
                          square
                          onClick={() =>
                            setSelectedBadge(row.badge_symbol)
                          }
                        >
                          <BadgeImage
                            src={row.offchain_lookup_data.user.ipfs_image}
                            size="xs"
                          />
                        </Button>
                      </Tooltip>
                    )
                )}
              <BadgeDetailModal
                open={!!selectedBadge}
                onOpenChange={(open) => {
                  if (!open) setSelectedBadge(null)
                }}
                badgeSymbol={selectedBadge ?? ''}
                scope={organization ?? name}
              />
            </div>
          )}
          <p className="text-body-2 text-gray-3">{content}</p>
          {currentActor && (
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
                    {isOwnPost ? 'Comment' : '+1 recognize'}
                  </Button>
                </motion.div>
              )}
              {showRecognize && isOwnPost && (
                <motion.form
                  onSubmit={commentForm.handleSubmit(onComment)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2 }}
                  className="border-gray-2 mt-4 space-y-4 border-t pt-4"
                >
                  <div>
                    <span className="text-body-2 mb-1 block font-medium text-white">
                      Comment
                    </span>
                    <label className="bg-gray-1 border-gray-2 block rounded-xl border p-4">
                      <textarea
                        {...commentForm.register('content')}
                        placeholder="Add a comment to your post."
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
                        !commentContent || commentContent.length === 0
                      }
                    >
                      Post
                    </Button>
                  </div>
                </motion.form>
              )}
              {showRecognize && !isOwnPost && (
                <motion.form
                  onSubmit={recognizeForm.handleSubmit(onRecognize)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2 }}
                  className="border-gray-2 mt-4 space-y-4 border-t pt-4"
                >
                  {beamBadges.length > 0 && (
                    <div>
                      <span className="text-body-2 mb-1 block font-medium text-white">
                        Beams
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {beamBadges.map((badge) => {
                          const isSelected = badgesWatched?.includes(
                            badge.badge_symbol
                          )
                          return (
                            <button
                              key={badge.badge_symbol}
                              type="button"
                              onClick={() => {
                                const current =
                                  recognizeForm.getValues('badges') ?? []
                                if (current.includes(badge.badge_symbol)) {
                                  recognizeForm.setValue(
                                    'badges',
                                    current.filter(
                                      (s) => s !== badge.badge_symbol
                                    ),
                                    { shouldValidate: true }
                                  )
                                } else {
                                  recognizeForm.setValue(
                                    'badges',
                                    [...current, badge.badge_symbol],
                                    { shouldValidate: true }
                                  )
                                }
                              }}
                              className={twMerge(
                                'border-gray-2 bg-gray-1 inline-flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors',
                                isSelected && 'border-white bg-gray-2'
                              )}
                            >
                              <BadgeImage
                                src={
                                  badge.offchain_lookup_data.user.ipfs_image
                                }
                                size="xs"
                              />
                              <span className="text-body-2 font-medium text-white">
                                {badge.onchain_lookup_data.user.display_name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {customBadges.length > 0 && (
                    <div>
                      <span className="text-body-2 mb-1 block font-medium text-white">
                        {beamBadges.length > 0 ? 'Other Badges' : 'Badges'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {customBadges
                          .filter((b) =>
                            badgesWatched?.includes(b.badge_symbol)
                          )
                          .map((badge) => (
                            <div
                              key={badge.badge_symbol}
                              className="border-white bg-gray-2 inline-flex items-center gap-2 rounded-xl border px-3 py-2"
                            >
                              <BadgeImage
                                src={
                                  badge.offchain_lookup_data.user.ipfs_image
                                }
                                size="xs"
                              />
                              <span className="text-body-2 font-medium text-white">
                                {badge.onchain_lookup_data.user.display_name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current =
                                    recognizeForm.getValues('badges') ?? []
                                  recognizeForm.setValue(
                                    'badges',
                                    current.filter(
                                      (s) => s !== badge.badge_symbol
                                    ),
                                    { shouldValidate: true }
                                  )
                                }}
                                className="text-gray-3 hover:text-white -mr-1"
                              >
                                <MdClose className="size-4" />
                              </button>
                            </div>
                          ))}
                        <Popover.Root
                          open={addBadgeOpen}
                          onOpenChange={setAddBadgeOpen}
                        >
                          <Popover.Trigger asChild>
                            <button
                              type="button"
                              className="border-gray-2 bg-gray-1 inline-flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors hover:border-white"
                            >
                              <span className="text-body-2 font-medium text-white">
                                + Add Badge
                              </span>
                            </button>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content
                              side="bottom"
                              align="start"
                              sideOffset={8}
                              className="border-gray-2 bg-gray-1 z-70 w-64 rounded-2xl border p-2"
                            >
                              <Command
                                filter={(value, search) => {
                                  const badge = customBadges.find(
                                    (b) => b.badge_symbol === value
                                  )
                                  if (
                                    badge?.onchain_lookup_data.user.display_name
                                      .toLowerCase()
                                      .includes(search.toLowerCase())
                                  )
                                    return 1
                                  return 0
                                }}
                              >
                                <Command.Input
                                  placeholder="Search badges"
                                  className="text-body-2 placeholder:text-gray-3 w-full bg-transparent px-2 py-1.5 text-white outline-none"
                                />
                                <Command.List className="mt-1 max-h-48 overflow-y-auto [&_[cmdk-list-sizer]]:space-y-1">
                                  <Command.Empty className="text-body-2 text-gray-3 py-4 text-center">
                                    No badges found.
                                  </Command.Empty>
                                  {customBadges
                                    .filter(
                                      (b) =>
                                        !badgesWatched?.includes(
                                          b.badge_symbol
                                        )
                                    )
                                    .map((badge) => (
                                      <Command.Item
                                        key={badge.badge_symbol}
                                        value={badge.badge_symbol}
                                        onSelect={() => {
                                          const current =
                                            recognizeForm.getValues(
                                              'badges'
                                            ) ?? []
                                          recognizeForm.setValue(
                                            'badges',
                                            [
                                              ...current,
                                              badge.badge_symbol,
                                            ],
                                            { shouldValidate: true }
                                          )
                                          setAddBadgeOpen(false)
                                        }}
                                        className="text-body-2 text-gray-3 data-[selected=true]:bg-gray-2 flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 outline-hidden select-none data-[selected=true]:text-white"
                                      >
                                        <BadgeImage
                                          src={
                                            badge.offchain_lookup_data.user
                                              .ipfs_image
                                          }
                                          size="xs"
                                        />
                                        <span className="text-body-2 font-medium">
                                          {
                                            badge.onchain_lookup_data.user
                                              .display_name
                                          }
                                        </span>
                                      </Command.Item>
                                    ))}
                                </Command.List>
                              </Command>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-body-2 mb-1 block font-medium text-white">
                      Message
                    </span>
                    <label className="bg-gray-1 border-gray-2 block rounded-xl border p-4">
                      <textarea
                        {...recognizeForm.register('content')}
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
                        !recognizeContent ||
                        recognizeContent.length === 0 ||
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
