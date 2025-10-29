import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MdClose } from 'react-icons/md'
import { toast } from 'react-toastify'
import z from 'zod'

import { listBadge } from '@/api/chain/badge/list-badge'
import { sendMultiBadge } from '@/api/chain/badge/send-multi-badge'
import { createPost } from '@/app/feed/actions'
import { Button } from '@/components/ui/button'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { InputBadges } from '@/components/ui/input-badges'
import { InputOrganization } from '@/components/ui/input-organization'
import { Textarea } from '@/components/ui/textarea'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

const mutualRecognitionSchema = z.object({
  mention: z.string().array().min(1, 'Members is required'),
  badges: z.string().array().min(1, 'Badges is required'),
  content: z.string().nonempty('Content is required'),
})

type MutualRecognitionSchema = z.infer<typeof mutualRecognitionSchema>

export function MutualRecognition() {
  const { session, actor } = useChain()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { name } = useOrganization()

  const badgesQuery = useQuery({
    queryKey: ['badges', name],
    queryFn: async () =>
      await listBadge({
        scope: name,
      }),
  })

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MutualRecognitionSchema>({
    resolver: zodResolver(mutualRecognitionSchema),
  })

  async function onSubmit({
    content,
    badges,
    mention,
  }: MutualRecognitionSchema) {
    try {
      const data = badges.map((badge) => ({
        session: session!,
        badge_symbol: badge,
        amount: 1,
        to: mention[0],
        memo: content,
      }))

      await sendMultiBadge(data)

      await createPost({
        actor: actor!,
        badgeSymbol: badges,
        mention,
        content,
      })
      reset()
      toast('Recognition published!')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    } catch {
      toast.error('Failed to send badge')
    }
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="primary"
          disabled={badgesQuery.data?.rows.length === 0}
        >
          Recognize
        </Button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50"
                onClick={() => {
                  reset()
                }}
              />
            </Dialog.Overlay>
            <Dialog.Content forceMount asChild>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 32 }}
                className="border-gray-2 bg-gray-1 fixed top-1/2 left-1/2 z-60 w-full max-w-[calc(var(--spacing-container-md)-2rem)] -translate-x-1/2 -translate-y-1/2 border p-4 shadow-lg max-md:h-svh md:rounded-2xl md:p-8"
              >
                <Dialog.Close asChild>
                  <Button
                    size="md"
                    variant="link"
                    square
                    className="absolute top-4 right-4"
                    onClick={() => {
                      reset()
                    }}
                  >
                    <MdClose className="size-6" />
                  </Button>
                </Dialog.Close>
                <Dialog.Title className="text-title-1 text-white">
                  Recognize
                </Dialog.Title>
                <Dialog.Description className="text-gray-3 text-body-2">
                  Recognize a team member by selecting badges and writing a
                  personalized message.
                </Dialog.Description>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-8 space-y-8"
                >
                  <Controller
                    name="mention"
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <Label>Who do you want to recognize?</Label>
                        {field.value && field.value.length > 0 ? (
                          <div className="border-gray-2 bg-gray-1 my-2 inline-flex h-10 items-center rounded-full border pl-2">
                            <span className="text-body-2 ml-1 font-sans font-medium text-nowrap text-white">
                              {field.value[0]}
                            </span>
                            <Button
                              size="md"
                              variant="link"
                              square
                              onClick={() => {
                                field.onChange([])
                              }}
                            >
                              <MdClose className="size-6" />
                            </Button>
                          </div>
                        ) : (
                          <InputOrganization
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                        <ErrorMessage>
                          {errors['mention']?.message}
                        </ErrorMessage>
                      </Field>
                    )}
                  />

                  <Controller
                    name="badges"
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <Label>Badges</Label>
                        <InputBadges
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <ErrorMessage>{errors['badges']?.message}</ErrorMessage>
                      </Field>
                    )}
                  />

                  <Field>
                    <Label htmlFor="content">
                      What do you want to recognize them for?
                    </Label>
                    <Textarea
                      {...register('content')}
                      id="content"
                      aria-invalid={!!errors['content']}
                      placeholder="Write your message"
                    />
                    <ErrorMessage>{errors['content']?.message}</ErrorMessage>
                  </Field>

                  <Button type="submit" variant="primary" size="lg">
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </Button>
                </form>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
