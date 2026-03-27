'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'

import { listBadge } from '@/api/chain/badge/list-badge'
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
import { getBeamWithTrackingBadges } from '@/utils/get-beam-tracking-badges'

function createAddSeriesSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('nameRequired')),
    beams: z.array(z.string()).nullish(),
    badges: z.array(z.string()).nullish(),
    start_right_away: z.boolean(),
  })
}

type AddSeriesSchema = z.infer<ReturnType<typeof createAddSeriesSchema>>

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
  const t = useTranslations('admin.addSeriesPage')
  const tc = useTranslations('admin.common')
  const tv = useTranslations('validation')
  const params = useParams()
  const searchParams = useSearchParams()
  const { session } = useChain()
  const { name, symbol } = useOrganization()
  const router = useRouter()
  const queryClient = useQueryClient()

  const title = decodeURIComponent(params.season_id as string)
    .split(',')[1]
    .replace(symbol.toUpperCase(), '')

  const badgesQuery = useQuery({
    queryKey: ['badges', name],
    queryFn: async () => await listBadge({ scope: name }),
    enabled: !!name,
  })

  const lastSeriesId = searchParams.get('last-series-id')
  const nextSeries = nthNumber(lastSeriesId ? Number(lastSeriesId) + 1 : 1)

  const {
    control,
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddSeriesSchema>({
    resolver: zodResolver(createAddSeriesSchema(tv)),
  })

  const prevTrackingRef = useRef<string[]>([])

  const getTrackingSymbols = useCallback(
    (beams: string[]) => {
      const orgBadgeSymbols = (badgesQuery.data?.rows ?? []).map(
        (b) => b.badge_symbol
      )
      const allExpanded = getBeamWithTrackingBadges(beams, orgBadgeSymbols)
      return allExpanded.filter((s) => !beams.includes(s))
    },
    [badgesQuery.data]
  )

  const beamsValue = watch('beams')

  useEffect(() => {
    const beams = beamsValue ?? []
    const prevTracking = prevTrackingRef.current
    const newTracking = getTrackingSymbols(beams)

    const badges = getValues('badges') ?? []

    const removedTracking = prevTracking.filter(
      (s) => !newTracking.includes(s)
    )
    const addedTracking = newTracking.filter(
      (s) => !prevTracking.includes(s)
    )

    const updatedBadges = [
      ...badges.filter((s) => !removedTracking.includes(s)),
      ...addedTracking.filter((s) => !badges.includes(s)),
    ]

    if (
      updatedBadges.length !== badges.length ||
      updatedBadges.some((s, i) => s !== badges[i])
    ) {
      setValue('badges', updatedBadges)
    }

    prevTrackingRef.current = newTracking
  }, [beamsValue, getTrackingSymbols, getValues, setValue])

  async function onSubmit({
    name,
    beams,
    badges,
    start_right_away,
  }: AddSeriesSchema) {
    try {
      const orgBadgeSymbols = (badgesQuery.data?.rows ?? []).map(
        (b) => b.badge_symbol
      )
      const beamBadgeSymbols = beams?.length
        ? getBeamWithTrackingBadges(beams, orgBadgeSymbols)
        : []
      const allBadgeSymbols = [...(badges ?? []), ...beamBadgeSymbols]

      await addSeries({
        session: session!,
        agg_symbol: decodeURIComponent(params.season_id as string),
        badge_symbols: allBadgeSymbols,
        sequence_description: name,
        start_right_away,
        seq_ids: [lastSeriesId ? Number(lastSeriesId) + 1 : 1],
      })
      toast.success(t('addSuccess'))
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['series'] }),
        queryClient.invalidateQueries({ queryKey: ['badges-status', name] }),
      ])
      router.push(`/admin/seasons/${params.season_id}`)
    } catch {
      toast.error(t('addFailed'))
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
              {t('title')} <span className="text-gray-3">({nextSeries})</span>
            </>
          }
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        <Box className="max-md:rounded-none max-md:border-0 max-md:bg-black max-md:p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Field>
              <Label htmlFor="name">{tc('name')}</Label>
              <Input
                id="name"
                {...register('name')}
                aria-invalid={!!errors['name']}
              />
              <ErrorMessage>{errors['name']?.message}</ErrorMessage>
            </Field>

            <Controller
              name="beams"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label>{t('additionalBeams')}</Label>
                  <InputBadges
                    value={field.value}
                    onChange={field.onChange}
                    beamsOnly
                  />
                  <ErrorMessage>{errors['beams']?.message}</ErrorMessage>
                </Field>
              )}
            />

            <Controller
              name="badges"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label>{t('additionalBadges')}</Label>
                  <InputBadges value={field.value} onChange={field.onChange} />
                  <ErrorMessage>{errors['badges']?.message}</ErrorMessage>
                </Field>
              )}
            />

            <Field>
              <CheckboxWrapper>
                <Label htmlFor="start_right_away" className="flex-1">
                  {t('startRightAway')}
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
              {isSubmitting ? tc('adding') : tc('add')}
            </Button>
          </form>
        </Box>
      </div>
    </>
  )
}
