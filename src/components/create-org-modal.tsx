'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { useQueryClient } from '@tanstack/react-query'
import type { UInt64 } from '@wharfkit/antelope'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MdClose } from 'react-icons/md'
import { toast } from 'react-toastify'
import z from 'zod'

import { createOrganization } from '@/api/chain/organization/create-organization'
import { updateOrganization } from '@/api/chain/organization/update-organization'
import {
  ensureOrgBadgePinataGroup,
  ensureOrgBeamsPinataGroup,
  ensureOrgPinataGroup,
} from '@/app/admin/organization/actions'
import { Button } from '@/components/ui/button'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useChain } from '@/contexts/chain'
import { uploadFile } from '@/lib/upload-file'

const TIMEZONES: { value: string; label: string; offset: number }[] = [
  { value: 'Etc/GMT+12', label: 'UTC-12:00 (Baker Island)', offset: -12 },
  { value: 'Etc/GMT+11', label: 'UTC-11:00 (Samoa)', offset: -11 },
  { value: 'Pacific/Honolulu', label: 'UTC-10:00 (Hawaii)', offset: -10 },
  { value: 'Pacific/Marquesas', label: 'UTC-09:30 (Marquesas)', offset: -9.5 },
  { value: 'America/Anchorage', label: 'UTC-09:00 (Alaska)', offset: -9 },
  { value: 'America/Los_Angeles', label: 'UTC-08:00 (Pacific)', offset: -8 },
  { value: 'America/Denver', label: 'UTC-07:00 (Mountain)', offset: -7 },
  { value: 'America/Chicago', label: 'UTC-06:00 (Central)', offset: -6 },
  { value: 'America/New_York', label: 'UTC-05:00 (Eastern)', offset: -5 },
  { value: 'America/Halifax', label: 'UTC-04:00 (Atlantic)', offset: -4 },
  { value: 'America/St_Johns', label: 'UTC-03:30 (Newfoundland)', offset: -3.5 },
  { value: 'America/Sao_Paulo', label: 'UTC-03:00 (South America)', offset: -3 },
  { value: 'Etc/GMT+2', label: 'UTC-02:00 (Mid-Atlantic)', offset: -2 },
  { value: 'Atlantic/Azores', label: 'UTC-01:00 (Azores)', offset: -1 },
  { value: 'Europe/London', label: 'UTC+00:00 (London, GMT)', offset: 0 },
  { value: 'Europe/Paris', label: 'UTC+01:00 (Central Europe)', offset: 1 },
  { value: 'Africa/Cairo', label: 'UTC+02:00 (Eastern Europe)', offset: 2 },
  { value: 'Europe/Istanbul', label: 'UTC+03:00 (Turkey, Moscow)', offset: 3 },
  { value: 'Asia/Tehran', label: 'UTC+03:30 (Iran)', offset: 3.5 },
  { value: 'Asia/Dubai', label: 'UTC+04:00 (Gulf)', offset: 4 },
  { value: 'Asia/Kabul', label: 'UTC+04:30 (Afghanistan)', offset: 4.5 },
  { value: 'Asia/Karachi', label: 'UTC+05:00 (Pakistan)', offset: 5 },
  { value: 'Asia/Kolkata', label: 'UTC+05:30 (India)', offset: 5.5 },
  { value: 'Asia/Kathmandu', label: 'UTC+05:45 (Nepal)', offset: 5.75 },
  { value: 'Asia/Dhaka', label: 'UTC+06:00 (Bangladesh)', offset: 6 },
  { value: 'Asia/Yangon', label: 'UTC+06:30 (Myanmar)', offset: 6.5 },
  { value: 'Asia/Bangkok', label: 'UTC+07:00 (Southeast Asia)', offset: 7 },
  { value: 'Asia/Shanghai', label: 'UTC+08:00 (China, Singapore)', offset: 8 },
  { value: 'Australia/Eucla', label: 'UTC+08:45 (Eucla)', offset: 8.75 },
  { value: 'Asia/Tokyo', label: 'UTC+09:00 (Japan, Korea)', offset: 9 },
  { value: 'Australia/Darwin', label: 'UTC+09:30 (Central Australia)', offset: 9.5 },
  { value: 'Australia/Sydney', label: 'UTC+10:00 (Eastern Australia)', offset: 10 },
  { value: 'Australia/Lord_Howe', label: 'UTC+10:30 (Lord Howe)', offset: 10.5 },
  { value: 'Pacific/Noumea', label: 'UTC+11:00 (New Caledonia)', offset: 11 },
  { value: 'Pacific/Auckland', label: 'UTC+12:00 (New Zealand)', offset: 12 },
  { value: 'Pacific/Chatham', label: 'UTC+12:45 (Chatham Islands)', offset: 12.75 },
  { value: 'Pacific/Tongatapu', label: 'UTC+13:00 (Tonga)', offset: 13 },
  { value: 'Pacific/Kiritimati', label: 'UTC+14:00 (Line Islands)', offset: 14 },
]

const orgFormSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  shortDescription: z
    .string()
    .max(255, 'Short description must be 255 characters or less')
    .optional(),
  about: z.string().optional(),
  purpose: z.string().optional(),
})

type OrgFormSchema = z.infer<typeof orgFormSchema>

type CreateOrgModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgCreationFee: string
  memberFee: string
  currentCycleId: UInt64
  memberCount: number
}

export function CreateOrgModal({
  open,
  onOpenChange,
  orgCreationFee,
  memberFee,
  currentCycleId,
  memberCount,
}: CreateOrgModalProps) {
  const { session } = useChain()
  const router = useRouter()
  const queryClient = useQueryClient()

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const [timezone, setTimezone] = useState(detectedTimezone)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgFormSchema>({
    resolver: zodResolver(orgFormSchema),
  })

  const parseUsd = (v: string) => parseFloat(v.replace(/[^0-9.]/g, '')) || 0
  const totalUsd = parseUsd(orgCreationFee) + parseUsd(memberFee) * memberCount

  async function onSubmit(data: OrgFormSchema) {
    if (!pendingFile) {
      setLogoError('Logo is required')
      return
    }

    if (!session || !currentCycleId) return

    setIsCreating(true)
    try {
      const orgName = session.actor.toString()

      await createOrganization({
        session,
        org_creation_fee: orgCreationFee,
        member_fee: memberFee,
        currentCycleId,
        memberCount,
        timezone,
      })

      await ensureOrgPinataGroup(orgName)
      await ensureOrgBadgePinataGroup(orgName)
      await ensureOrgBeamsPinataGroup(orgName)

      const imageHash = await uploadFile(pendingFile, {
        groupName: `org-${orgName}`,
      })

      await updateOrganization({
        session,
        org: orgName,
        display_name: data.displayName,
        ipfs_image: imageHash,
        short_description: data.shortDescription,
        about: data.about,
        purpose: data.purpose,
      })

      toast.success('Organization created successfully!')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.refetchQueries({ queryKey: ['billing-detail'] })
      router.push('/admin/organization')
    } catch {
      toast.error('Failed to create organization')
    } finally {
      setIsCreating(false)
    }
  }

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
                className="border-gray-2 bg-gray-1 fixed top-1/2 left-1/2 z-60 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-lg max-md:h-svh max-md:max-w-none max-md:rounded-none"
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

                <div className="max-h-[80vh] overflow-y-auto p-6 max-md:max-h-svh [scrollbar-width:none] md:p-8">
                  <Dialog.Title className="text-title-2 mb-6 text-white">
                    Set Up Your Organization
                  </Dialog.Title>

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <Field>
                      <Label htmlFor="org-displayName">
                        Organization Name
                      </Label>
                      <Input
                        id="org-displayName"
                        {...register('displayName')}
                        aria-invalid={!!errors.displayName}
                        disabled={isCreating}
                        placeholder="My Organization"
                      />
                      <ErrorMessage>
                        {errors.displayName?.message}
                      </ErrorMessage>
                    </Field>

                    <Field>
                      <Label>Logo</Label>
                      <ImageUpload
                        variant="avatar"
                        onFileSelect={(file) => {
                          setPendingFile(file)
                          setLogoError(null)
                        }}
                        isUploading={isCreating}
                      />
                      {logoError && <ErrorMessage>{logoError}</ErrorMessage>}
                      <span className="text-body-3 text-gray-3 mt-1 block">
                        Recommended: 400 x 400px
                      </span>
                    </Field>

                    <Field>
                      <Label>Timezone</Label>
                      <Select
                        label="Timezone"
                        value={timezone}
                        onValueChange={setTimezone}
                        className="w-full"
                      >
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </Select>
                      <span className="text-body-3 text-gray-3 mt-1 block">
                        Sets when daily beam cycles reset for your
                        organization
                      </span>
                    </Field>

                    <Field>
                      <Label htmlFor="org-shortDescription">
                        Short Description
                      </Label>
                      <Textarea
                        id="org-shortDescription"
                        {...register('shortDescription')}
                        placeholder="A brief tagline for your organization"
                        maxLength={255}
                        aria-invalid={!!errors.shortDescription}
                        className="min-h-20"
                        disabled={isCreating}
                      />
                      <ErrorMessage>
                        {errors.shortDescription?.message}
                      </ErrorMessage>
                    </Field>

                    <Field>
                      <Label htmlFor="org-about">
                        About Organization
                      </Label>
                      <Textarea
                        id="org-about"
                        {...register('about')}
                        placeholder="Tell people about your organization"
                        className="min-h-24"
                        disabled={isCreating}
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="org-purpose">
                        Organization Purpose
                      </Label>
                      <Textarea
                        id="org-purpose"
                        {...register('purpose')}
                        placeholder="What is your organization's purpose?"
                        className="min-h-24"
                        disabled={isCreating}
                      />
                    </Field>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full justify-center"
                      disabled={isCreating}
                    >
                      {isCreating
                        ? 'Creating Organization...'
                        : `Create Organization — $${totalUsd.toFixed(2)}`}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
