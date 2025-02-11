'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { addSeries } from '@/api/chain/series/add-series'
import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxWrapper } from '@/components/ui/checkbox'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputBadges } from '@/components/ui/input-badges'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

const addSeriesSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  badges: z.array(z.string()).nullish(),
  start_right_away: z.boolean(),
})

type AddSeriesSchema = z.infer<typeof addSeriesSchema>

const nthNumber = (number: number) => {
  if (number > 3 && number < 21) return `${number}th`
  switch (number % 10) {
    case 1:
      return `${number}st`
    case 2:
      return `${number}nd`
    case 3:
      return `${number}rd`
    default:
      return `${number}th`
  }
}

export default function AddSeriesPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { session } = useChain()
  const { symbol } = useOrganization()
  const router = useRouter()

  const title = decodeURIComponent(params.season_id as string)
    .split(',')[1]
    .replace(symbol.toUpperCase(), '')

  const lastSeriesId = searchParams.get('last-series-id')
  const nextSeries = nthNumber(lastSeriesId ? Number(lastSeriesId) + 1 : 1)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddSeriesSchema>({
    resolver: zodResolver(addSeriesSchema),
  })

  async function onSubmit({ name, badges, start_right_away }: AddSeriesSchema) {
    try {
      await addSeries({
        session: session!,
        agg_symbol: decodeURIComponent(params.season_id as string),
        badge_symbols: badges ?? [],
        sequence_description: name,
        start_right_away,
      })
      router.push(`/admin/seasons/${params.season_id}`)
    } catch (error) {
      console.log(error)
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
              Add Series <span className="text-gray-3">({nextSeries})</span>
            </>
          }
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        <Box className="max-md:rounded-none max-md:border-0 max-md:bg-black max-md:p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

            <Field>
              <CheckboxWrapper>
                <Label htmlFor="start_right_away" className="flex-1">
                  Start the new series right away
                </Label>
                <Checkbox
                  id="start_right_away"
                  {...register('start_right_away')}
                  aria-invalid={!!errors['start_right_away']}
                />
              </CheckboxWrapper>
              <ErrorMessage>{errors['start_right_away']?.message}</ErrorMessage>
            </Field>

            <Button type="submit" variant="primary" size="lg">
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </Box>
      </div>
    </>
  )
}
