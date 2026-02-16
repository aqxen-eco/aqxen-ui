'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'

import { addBadgeToSeason } from '@/api/chain/season/add-badge-to-season'
import { addBadgeToSeries } from '@/api/chain/series/add-badge-to-series'
import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { InputBadges } from '@/components/ui/input-badges'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

const addBadgesSchema = z.object({
  badges: z.string().array().min(1, 'Badges is required'),
})

type AddBadgesSchema = z.infer<typeof addBadgesSchema>

export default function AddBadgesPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const series = searchParams.get('series')
  const { name, symbol } = useOrganization()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { session } = useChain()

  const title = decodeURIComponent(params.season_id as string)
    .split(',')[1]
    .replace(symbol.toUpperCase(), '')

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddBadgesSchema>({
    resolver: zodResolver(addBadgesSchema),
  })

  async function onSubmit({ badges }: AddBadgesSchema) {
    try {
      if (series) {
        await addBadgeToSeries({
          session: session!,
          agg_symbol: decodeURIComponent(params.season_id as string),
          seq_ids: [Number(series)],
          badge_symbols: badges,
        })
        queryClient.invalidateQueries({
          queryKey: ['seasons', params.season_id, name],
        })
      } else {
        await addBadgeToSeason({
          session: session!,
          agg_symbol: decodeURIComponent(params.season_id as string),
          badge_symbols: badges,
        })
        queryClient.invalidateQueries({
          queryKey: ['series', params.season_id],
        })
      }
      toast.success('Badge added successfully')
      router.push(`/admin/seasons/${params.season_id}`)
    } catch {
      toast.error('Failed to add badge')
    }
  }

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href={`/admin/seasons/${params.season_id}`}>
          {title}
        </HeaderAdminBack>
        <HeaderAdminTitle
          title={
            <>
              Add badge{' '}
              <span className="text-gray-3">
                ({series ? 'to series' : 'to season'})
              </span>
            </>
          }
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        <Box className="max-md:rounded-none max-md:border-0 max-md:bg-black max-md:p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Controller
              name="badges"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label>Badges</Label>
                  <InputBadges value={field.value} onChange={field.onChange} />
                  <ErrorMessage>{errors['badges']?.message}</ErrorMessage>
                </Field>
              )}
            />

            <Button type="submit" variant="primary" size="lg">
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </Box>
      </div>
    </>
  )
}
