'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'

import { updateOrganization } from '@/api/chain/organization/update-organization'
import { BadgeImage } from '@/components/ui/badge-image'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { uploadFile } from '@/lib/upload-file'

const organizationSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  ipfs: z.string().optional(),
  shortDescription: z
    .string()
    .max(255, 'Short description must be 255 characters or less')
    .optional(),
  about: z.string().optional(),
  purpose: z.string().optional(),
})

type OrganizationSchema = z.infer<typeof organizationSchema>

export default function OrganizationPage() {
  const { session } = useChain()
  const {
    name,
    symbol,
    displayName,
    ipfs,
    shortDescription,
    about,
    purpose,
  } = useOrganization()

  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationSchema>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      displayName: displayName,
      ipfs: ipfs,
      shortDescription: shortDescription,
      about: about,
      purpose: purpose,
    },
  })

  const logo = watch('ipfs')

  async function onSubmit({
    displayName,
    ipfs,
    shortDescription,
    about,
    purpose,
  }: OrganizationSchema) {
    if (!pendingFile && !ipfs) {
      setError('ipfs', { message: 'Logo is required' })
      return
    }

    try {
      let imageHash = ipfs ?? ''

      if (pendingFile) {
        setIsUploading(true)
        try {
          imageHash = await uploadFile(pendingFile, {
            groupName: `org-${name}`,
          })
        } finally {
          setIsUploading(false)
        }
      }

      await updateOrganization({
        session: session!,
        org: name,
        display_name: displayName,
        ipfs_image: imageHash,
        short_description: shortDescription,
        about,
        purpose,
      })
      setPendingFile(null)
      toast.success('Organization details saved successfully.')
    } catch {
      toast.error('Failed to save organization.')
    }
  }

  useEffect(() => {
    reset({
      displayName,
      ipfs,
      shortDescription,
      about,
      purpose,
    })
  }, [displayName, ipfs, shortDescription, about, purpose, reset])

  return (
    <Box className="p-0 max-md:space-y-8 max-md:rounded-none max-md:border-0 max-md:bg-black md:grid md:grid-cols-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-md:p-0 md:col-span-4"
      >
        <Field>
          <Label htmlFor="displayName">Name</Label>
          <Input
            id="displayName"
            {...register('displayName')}
            aria-invalid={!!errors['displayName']}
            disabled={isSubmitting || isUploading}
          />
          <ErrorMessage>{errors['displayName']?.message}</ErrorMessage>
        </Field>
        <Field>
          <Label>Logo</Label>
          <ImageUpload
            variant="avatar"
            value={logo}
            onFileSelect={(file) => setPendingFile(file)}
            isUploading={isUploading}
          />
          <ErrorMessage>{errors['ipfs']?.message}</ErrorMessage>
          <span className="text-body-3 text-gray-3 mt-1 block">
            Recommended: 400 x 400px
          </span>
        </Field>
        <Field>
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea
            id="shortDescription"
            {...register('shortDescription')}
            placeholder="A brief tagline for your organization"
            maxLength={255}
            aria-invalid={!!errors['shortDescription']}
            className="min-h-32"
            disabled={isSubmitting || isUploading}
          />
          <ErrorMessage>{errors['shortDescription']?.message}</ErrorMessage>
        </Field>
        <Field>
          <Label htmlFor="about">About Organization</Label>
          <Textarea
            id="about"
            {...register('about')}
            placeholder="Tell people about your organization"
            className="min-h-48"
            disabled={isSubmitting || isUploading}
          />
        </Field>
        <Field>
          <Label htmlFor="purpose">Organization Purpose</Label>
          <Textarea
            id="purpose"
            {...register('purpose')}
            placeholder="What is your organization's purpose?"
            className="min-h-48"
            disabled={isSubmitting || isUploading}
          />
        </Field>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting || isUploading ? 'Saving...' : 'Save'}
        </Button>
      </form>
      <div className="border-gray-2 max-md:bg-gray-1 space-y-4 border-l p-8 max-md:rounded-2xl max-md:border max-md:p-4 md:col-span-2">
        <h2 className="text-title-2 text-white">Organization preview</h2>
        <div
          className={`mx-auto w-fit rounded-full ${logo ? 'bg-white' : ''}`}
        >
          <BadgeImage src={logo} />
        </div>
        <p className="text-body-2 mt-2 text-center font-medium text-white">
          {displayName ?? name}
        </p>
        <p className="text-body-2 text-gray-3 text-center">
          {symbol.toUpperCase()} badge
        </p>
        <div className="text-center">
          <Button asChild variant="primary" size="md">
            <Link href={`/organizations/${name}`}>View</Link>
          </Button>
        </div>
      </div>
    </Box>
  )
}
