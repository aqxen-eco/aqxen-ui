'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { MdClose } from 'react-icons/md'

import { listBadge } from '@/api/chain/badge/list-badge'
import type { Badge } from '@/api/model/badge'
import { getPostsByBadge } from '@/app/feed/actions'
import { IPFS_IMAGE_SOURCE } from '@/constants'

import { Avatar } from './avatar'
import { BadgeImage } from './badge-image'
import { Button } from './button'

type BadgeDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  badgeSymbol: string
  scope?: string
  badge?: Badge
}

export function BadgeDetailModal({
  open,
  onOpenChange,
  badgeSymbol,
  scope,
  badge: badgeProp,
}: BadgeDetailModalProps) {
  const badgeQuery = useQuery({
    queryKey: ['badge-detail', scope, badgeSymbol],
    queryFn: async () => {
      const result = await listBadge({ scope })
      return result.rows.find((row) => row.badge_symbol === badgeSymbol)
    },
    enabled: open && !!scope && !badgeProp,
  })

  const awardsQuery = useQuery({
    queryKey: ['badge-awards', badgeSymbol],
    queryFn: () => getPostsByBadge({ badgeSymbol }),
    enabled: open,
  })

  const badge = badgeProp ?? badgeQuery.data
  const isLoading = !badgeProp && badgeQuery.isLoading

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50"
              />
            </Dialog.Overlay>
            <Dialog.Content forceMount asChild>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 32 }}
                className="border-gray-2 bg-gray-1 fixed top-1/2 left-1/2 z-60 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-lg max-md:h-svh max-md:max-w-none max-md:rounded-none"
              >
                <Dialog.Close asChild>
                  <Button
                    size="md"
                    variant="link"
                    square
                    className="absolute top-4 right-4 z-10"
                  >
                    <MdClose className="size-6" />
                  </Button>
                </Dialog.Close>

                <div className="max-h-[80vh] overflow-y-auto p-6 max-md:max-h-svh md:p-8">
                  {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-body-2 text-gray-3">Loading...</p>
                    </div>
                  ) : badge ? (
                    <>
                      <div className="flex flex-col items-center text-center">
                        <BadgeImage
                          src={badge.offchain_lookup_data.user.ipfs_image}
                          size="lg"
                        />
                        <Dialog.Title className="text-title-2 mt-4 text-white">
                          {badge.onchain_lookup_data.user.display_name}
                        </Dialog.Title>
                        <Dialog.Description className="text-body-2 text-gray-3 mt-1">
                          {badge.onchain_lookup_data.user.description}
                        </Dialog.Description>
                        {badge.rarity_counts && (
                          <p className="text-body-3 text-gray-3 mt-2">
                            Rarity: {badge.rarity_counts}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-2 my-6 h-px" />

                      <h3 className="text-body-1 mb-4 font-medium text-white">
                        Award History
                      </h3>

                      {awardsQuery.isLoading ? (
                        <p className="text-body-2 text-gray-3">
                          Loading history...
                        </p>
                      ) : awardsQuery.data &&
                        awardsQuery.data.length > 0 ? (
                        <div className="space-y-4">
                          {awardsQuery.data.map((post) => (
                            <div
                              key={post.id}
                              className="border-gray-2 rounded-xl border p-4"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar
                                  size="sm"
                                  src={
                                    post.user.avatarIpfs
                                      ? IPFS_IMAGE_SOURCE +
                                        post.user.avatarIpfs
                                      : undefined
                                  }
                                >
                                  {post.user.actor.slice(0, 2)}
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="text-body-2 text-white">
                                    <Link
                                      href={`/profile/${post.user.actor}`}
                                      className="hover:underline"
                                    >
                                      {post.user.actor}
                                    </Link>
                                    {post.mention.length > 0 && (
                                      <>
                                        <span className="text-gray-3">
                                          {' '}
                                          →{' '}
                                        </span>
                                        {post.mention.map((m, i) => (
                                          <span key={m.id}>
                                            {i > 0 && (
                                              <span className="text-gray-3">
                                                ,{' '}
                                              </span>
                                            )}
                                            <Link
                                              href={`/profile/${m.user.actor}`}
                                              className="hover:underline"
                                            >
                                              {m.user.actor}
                                            </Link>
                                          </span>
                                        ))}
                                      </>
                                    )}
                                  </p>
                                  <p className="text-body-3 text-gray-3">
                                    {format(
                                      new Date(post.createdAt),
                                      'EEE d MMM yyyy'
                                    )}
                                  </p>
                                </div>
                              </div>
                              {post.content && (
                                <p className="text-body-2 text-gray-3 mt-2">
                                  {post.content}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-body-2 text-gray-3">
                          No awards yet for this badge.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-body-2 text-gray-3">
                        Badge not found.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
