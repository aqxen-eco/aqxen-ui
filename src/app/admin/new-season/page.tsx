'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'

import { listBadge } from '@/api/chain/badge/list-badge'
import { createSeason } from '@/api/chain/season/create-season'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputBadges } from '@/components/ui/input-badges'
import { InputSymbol } from '@/components/ui/input-symbol'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

const newSeasonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(3, 'Symbol is required'),
  badges: z.string().array().min(1, 'Badges is required'),
  stats: z.string().array().min(1, 'Stats badges is required'),
})

type NewSeasonSchema = z.infer<typeof newSeasonSchema>

export default function NewSeasonPage() {
  const { addOrganizationSymbol, name: orgName } = useOrganization()
  const { session } = useChain()
  const router = useRouter()
  const queryClient = useQueryClient()

  const badgesQuery = useQuery({
    queryKey: ['badges', orgName],
    queryFn: async () => await listBadge({ scope: orgName }),
    enabled: !!orgName,
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewSeasonSchema>({
    resolver: zodResolver(newSeasonSchema),
  })

  async function onSubmit({ name, symbol, badges, stats }: NewSeasonSchema) {
    try {
      await createSeason({
        session: session!,
        agg_symbol: addOrganizationSymbol(symbol),
        badge_symbols: badges,
        stats_badge_symbols: stats,
        ipfs_image: '',
        display_name: name,
        description: '',
      })
      toast.success('Season created successfully')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.refetchQueries({ queryKey: ['seasons', orgName] })
      router.push('/admin/seasons')
    } catch {
      toast.error('Failed to create season')
    }
  }

  return (
    <Box className="p-0 max-md:rounded-none max-md:border-0 max-md:bg-black">
      {badgesQuery.isSuccess && badgesQuery.data.rows.length === 0 && (
        <div className="bg-gray-2 border-gray-3 m-8 mb-0 rounded-lg border p-4 max-md:mx-0">
          <p className="text-body-2 text-gray-4">
            No badges found for your organization.{' '}
            <Link
              href="/admin/new-badge"
              className="text-white underline"
            >
              Create a badge
            </Link>{' '}
            to get started.
          </p>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-md:p-0"
      >
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="String"
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
        <Controller
          name="badges"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="badges">Badges</Label>
              <InputBadges value={field.value} onChange={field.onChange} />
              <ErrorMessage>{errors['badges']?.message}</ErrorMessage>
            </Field>
          )}
        />
        <Controller
          name="stats"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="stats">Stats badges</Label>
              <InputBadges value={field.value} onChange={field.onChange} />
              <ErrorMessage>{errors['stats']?.message}</ErrorMessage>
            </Field>
          )}
        />
        <Button type="submit" variant="primary" size="lg">
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </form>
    </Box>
  )
}
