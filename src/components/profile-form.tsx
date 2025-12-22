'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { MdClose } from 'react-icons/md'
import { toast } from 'react-toastify'
import z from 'zod'

import { updateProfile } from '@/app/profile/[user]/actions'
import { getUserProfile } from '@/app/profile/[user]/functions'
import { Button } from '@/components/ui/button'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useChain } from '@/contexts/chain'

const profileSchema = z.object({
  name: z.string().optional(),
  about: z.string().optional(),
  location: z.string().optional(),
  interests: z.string().optional(),
})

type ProfileSchema = z.infer<typeof profileSchema>

export function ProfileForm() {
  const { actor } = useChain()
  const params = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (actor) {
      async function loadProfile() {
        const user = await getUserProfile({ actor: actor! })
        reset({
          name: user?.name ?? '',
          about: user?.about ?? '',
          location: user?.location ?? '',
          interests: user?.interests ?? '',
        })
      }
      loadProfile()
    }
  }, [actor, reset])

  async function onSubmit({ name, about, location, interests }: ProfileSchema) {
    try {
      await updateProfile({
        actor: actor!,
        name,
        about,
        location,
        interests,
      })
      reset({
        name,
        about,
        location,
        interests,
      })
      toast('Profile updated!')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      router.refresh()
    } catch {
      toast.error('Failed to update profile')
    }
    setOpen(false)
  }

  if (params.user !== actor) {
    return null
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="secondary" className="absolute top-4 right-4 z-10">
          Edit profile
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
                  Profile
                </Dialog.Title>
                <Dialog.Description className="text-gray-3 text-body-2">
                  Update your profile by selecting badges and writing a
                  personalized message.
                </Dialog.Description>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-8 space-y-8"
                >
                  <Field>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      {...register('name')}
                      id="name"
                      aria-invalid={!!errors['name']}
                      placeholder="Write your name"
                      disabled={isLoading}
                    />
                    <ErrorMessage>{errors['name']?.message}</ErrorMessage>
                  </Field>

                  <Field>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      {...register('location')}
                      id="location"
                      aria-invalid={!!errors['location']}
                      placeholder="Write your location"
                      disabled={isLoading}
                    />
                    <ErrorMessage>{errors['location']?.message}</ErrorMessage>
                  </Field>

                  <Field>
                    <Label htmlFor="interests">Interests</Label>
                    <Input
                      {...register('interests')}
                      id="interests"
                      aria-invalid={!!errors['interests']}
                      placeholder="Write your interests"
                      disabled={isLoading}
                    />
                    <ErrorMessage>{errors['interests']?.message}</ErrorMessage>
                  </Field>

                  <Field>
                    <Label htmlFor="about">About</Label>
                    <Textarea
                      {...register('about')}
                      id="about"
                      aria-invalid={!!errors['about']}
                      placeholder="Write about you"
                      disabled={isLoading}
                    />
                    <ErrorMessage>{errors['about']?.message}</ErrorMessage>
                  </Field>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
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
