'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'

import { createBadge } from '@/api/chain/badge/create-badge'
import { Badge } from '@/components/ui/badge'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxWrapper } from '@/components/ui/checkbox'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { InputSymbol } from '@/components/ui/input-symbol'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { uploadFile } from '@/lib/upload-file'

const newBadgeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().length(3, 'Symbol is required'),
  image: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  lifetimeAggregate: z.boolean(),
  lifetimeStats: z.boolean(),
})

type NewBadgeSchema = z.infer<typeof newBadgeSchema>

export default function NewBadgePage() {
  const {
    name: orgName,
    symbol: organizationSymbol,
    addOrganizationSymbol,
  } = useOrganization()
  const router = useRouter()
  const { session } = useChain()

  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewBadgeSchema>({
    resolver: zodResolver(newBadgeSchema),
  })

  const name = watch('name')
  const symbol = watch('symbol')
  const image = watch('image')

  async function onSubmit({
    name,
    symbol,
    image,
    description,
    lifetimeAggregate,
    lifetimeStats,
  }: NewBadgeSchema) {
    if (!pendingFile && !image) {
      setError('image', { message: 'Image is required' })
      return
    }

    try {
      let imageHash = image ?? ''

      if (pendingFile) {
        setIsUploading(true)
        try {
          imageHash = await uploadFile(pendingFile, {
            groupName: `org-${orgName}-badges`,
            name: `org-${orgName}-badge-${name}`,
          })
        } finally {
          setIsUploading(false)
        }
      }

      await createBadge({
        session: session!,
        symbol: organizationSymbol + symbol,
        display_name: name,
        ipfs_image: imageHash,
        description,
        lifetime_aggregate: lifetimeAggregate,
        lifetime_stats: lifetimeStats,
        memo: description,
      })
      router.push('/admin/badges')
    } catch {
      toast.error('Failed to create badge')
    }
  }

  return (
    <Box className="p-0 max-md:space-y-8 max-md:rounded-none max-md:border-0 max-md:bg-black md:grid md:grid-cols-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-md:p-0 md:col-span-4"
      >
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            aria-invalid={!!errors['name']}
          />
          <ErrorMessage>{errors['name']?.message}</ErrorMessage>
        </Field>
        <Controller
          name="symbol"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="symbol">Symbol</Label>
              <InputSymbol
                id="symbol"
                aria-invalid={!!errors['symbol']}
                maxLength={3}
                {...field}
              />
              <ErrorMessage>{errors['symbol']?.message}</ErrorMessage>
            </Field>
          )}
        />
        <Field>
          <Label>Image</Label>
          <ImageUpload
            variant="avatar"
            value={image}
            onFileSelect={(file) => {
              setPendingFile(file)
              setPreview(URL.createObjectURL(file))
            }}
            isUploading={isUploading}
          />
          <ErrorMessage>{errors['image']?.message}</ErrorMessage>
          <span className="text-body-3 text-gray-3 mt-1 block">
            Recommended: 400 x 400px
          </span>
        </Field>
        <Field>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            {...register('description')}
            aria-invalid={!!errors['description']}
          />
          <ErrorMessage>{errors['description']?.message}</ErrorMessage>
        </Field>
        <Field>
          <CheckboxWrapper>
            <Label htmlFor="lifetimeAggregate" className="flex-1">
              Lifetime Aggregate
            </Label>
            <Checkbox
              id="lifetimeAggregate"
              {...register('lifetimeAggregate')}
              aria-invalid={!!errors['lifetimeAggregate']}
            />
          </CheckboxWrapper>
          <ErrorMessage>{errors['lifetimeAggregate']?.message}</ErrorMessage>
        </Field>
        <Field>
          <CheckboxWrapper>
            <Label htmlFor="lifetimeStats" className="flex-1">
              Lifetime Stats
            </Label>
            <Checkbox
              id="lifetimeStats"
              {...register('lifetimeStats')}
              aria-invalid={!!errors['lifetimeStats']}
            />
          </CheckboxWrapper>
          <ErrorMessage>{errors['lifetimeStats']?.message}</ErrorMessage>
        </Field>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting || isUploading ? 'Creating...' : 'Create'}
        </Button>
      </form>
      <div className="border-gray-2 max-md:bg-gray-1 space-y-4 border-l p-8 max-md:rounded-2xl max-md:border max-md:p-4 md:col-span-2">
        <h2 className="text-title-2 text-white">Badge preview</h2>
        <Badge
          ipfs={preview ?? image}
          name={name ? name : 'Badge Name'}
          balance={symbol ? symbol.toUpperCase() : 'BDG'}
        />
      </div>
    </Box>
  )
}
