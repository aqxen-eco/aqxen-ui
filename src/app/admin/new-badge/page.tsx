'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { createBadge } from '@/api/chain/badge'
import { Badge } from '@/components/ui/badge'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { InputSymbol } from '@/components/ui/input-symbol'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

const newBadgeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().length(3, 'Symbol is required'),
  image: z.string().min(1, 'IPFS Image hash is required'),
  description: z.string().min(1, 'Description is required'),
  lifetimeAggregate: z.boolean(),
  lifetimeStats: z.boolean(),
})

type NewBadgeSchema = z.infer<typeof newBadgeSchema>

export default function NewBadgePage() {
  const { symbol: organizationSymbol } = useOrganization()
  const { session } = useChain()

  const {
    control,
    register,
    handleSubmit,
    watch,
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
    try {
      await createBadge({
        session: session!,
        symbol: organizationSymbol + symbol,
        ipfs: image,
        name,
        lifetime_aggregate: lifetimeAggregate,
        lifetime_stats: lifetimeStats,
        memo: description,
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Box className="p-0 mobile:space-y-8 mobile:rounded-none mobile:border-0 mobile:bg-black desktop:grid desktop:grid-cols-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 mobile:p-0 desktop:col-span-4"
      >
        <Input
          {...register('name')}
          label="Name"
          error={errors['name']?.message}
        />
        <Controller
          name="symbol"
          control={control}
          render={({ field }) => (
            <InputSymbol
              label="Symbol"
              error={errors['symbol']?.message}
              maxLength={3}
              {...field}
            />
          )}
        />
        <Input
          {...register('image')}
          label="IPFS Image hash"
          error={errors['image']?.message}
        />
        <Input
          {...register('description')}
          label="Description"
          error={errors['description']?.message}
        />
        <Checkbox
          {...register('lifetimeAggregate')}
          label="Lifetime Aggregate"
          error={errors['lifetimeAggregate']?.message}
        />
        <Checkbox
          {...register('lifetimeStats')}
          label="Lifetime Stats"
          error={errors['lifetimeStats']?.message}
        />
        <Button type="submit" variant="primary" size="lg">
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </form>
      <div className="space-y-4 border-l border-gray-2 p-8 mobile:rounded-2xl mobile:border mobile:bg-gray-1 mobile:p-4 desktop:col-span-2">
        <h2 className="text-title-2 text-white">Badge preview</h2>
        <Badge
          ipfs={image ? IPFS_IMAGE_SOURCE + image : ''}
          name={name ? name : 'Badge Name'}
          balance={symbol ? symbol.toUpperCase() : 'BDG'}
        />
        <hr className="border-t border-gray-2" />
        <div className="flex justify-between py-2">
          <p className="text-body-2 text-white">Lorem</p>
          <p className="text-body-2 text-white">914</p>
        </div>
      </div>
    </Box>
  )
}
