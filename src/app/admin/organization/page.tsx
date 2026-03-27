'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
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

function createOrganizationSchema(t: (key: string) => string) {
  return z.object({
    displayName: z.string().min(1, t('nameRequired')),
    ipfs: z.string().optional(),
    shortDescription: z
      .string()
      .max(255, t('shortDescriptionMax'))
      .optional(),
    about: z.string().optional(),
    purpose: z.string().optional(),
  })
}

type OrganizationSchema = z.infer<ReturnType<typeof createOrganizationSchema>>

export default function OrganizationPage() {
  const t = useTranslations('admin.organization')
  const tc = useTranslations('admin.common')
  const tv = useTranslations('validation')
  const { session, actor } = useChain()
  const queryClient = useQueryClient()
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
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationSchema>({
    resolver: zodResolver(createOrganizationSchema(tv)),
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
      setError('ipfs', { message: tv('logoRequired') })
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
      setPreview(null)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: ['organization', actor],
      })
      toast.success(t('saveSuccess'))
    } catch {
      toast.error(t('saveFailed'))
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
          <Label htmlFor="displayName">{tc('name')}</Label>
          <Input
            id="displayName"
            {...register('displayName')}
            aria-invalid={!!errors['displayName']}
            disabled={isSubmitting || isUploading}
          />
          <ErrorMessage>{errors['displayName']?.message}</ErrorMessage>
        </Field>
        <Field>
          <Label>{t('logo')}</Label>
          <ImageUpload
            variant="avatar"
            value={logo}
            onFileSelect={(file) => {
              setPendingFile(file)
              setPreview(URL.createObjectURL(file))
            }}
            isUploading={isUploading}
          />
          <ErrorMessage>{errors['ipfs']?.message}</ErrorMessage>
          <span className="text-body-3 text-gray-3 mt-1 block">
            {tc('recommendedSize')}
          </span>
        </Field>
        <Field>
          <Label htmlFor="shortDescription">{t('shortDescription')}</Label>
          <Textarea
            id="shortDescription"
            {...register('shortDescription')}
            placeholder={t('shortDescriptionPlaceholder')}
            maxLength={255}
            aria-invalid={!!errors['shortDescription']}
            className="min-h-32"
            disabled={isSubmitting || isUploading}
          />
          <ErrorMessage>{errors['shortDescription']?.message}</ErrorMessage>
        </Field>
        <Field>
          <Label htmlFor="about">{t('aboutOrganization')}</Label>
          <Textarea
            id="about"
            {...register('about')}
            placeholder={t('aboutPlaceholder')}
            className="min-h-48"
            disabled={isSubmitting || isUploading}
          />
        </Field>
        <Field>
          <Label htmlFor="purpose">{t('organizationPurpose')}</Label>
          <Textarea
            id="purpose"
            {...register('purpose')}
            placeholder={t('purposePlaceholder')}
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
          {isSubmitting || isUploading ? tc('saving') : tc('save')}
        </Button>
      </form>
      <div className="border-gray-2 max-md:bg-gray-1 space-y-4 border-l p-8 max-md:rounded-2xl max-md:border max-md:p-4 md:col-span-2">
        <h2 className="text-title-2 text-white">{t('preview')}</h2>
        <div
          className={`mx-auto w-fit rounded-full ${logo ? 'bg-white' : ''}`}
        >
          <BadgeImage src={preview ?? logo} />
        </div>
        <p className="text-body-2 mt-2 text-center font-medium text-white">
          {displayName ?? name}
        </p>
        <p className="text-body-2 text-gray-3 text-center">
          {symbol.toUpperCase()} badge
        </p>
        <div className="text-center">
          <Button asChild variant="primary" size="md">
            <Link href={`/organizations/${name}`}>{tc('view')}</Link>
          </Button>
        </div>
      </div>
    </Box>
  )
}
