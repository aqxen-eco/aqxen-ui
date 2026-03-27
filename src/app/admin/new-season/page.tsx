'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef } from 'react'
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
import { getBeamWithTrackingBadges } from '@/utils/get-beam-tracking-badges'

function createNewSeasonSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('nameRequired')),
    symbol: z.string().min(3, t('symbolRequired')),
    beams: z.array(z.string()).nullish(),
    badges: z.string().array().min(1, t('badgesRequired')),
    stats: z.string().array().min(1, t('statsBadgesRequired')),
  })
}

type NewSeasonSchema = z.infer<ReturnType<typeof createNewSeasonSchema>>

export default function NewSeasonPage() {
  const t = useTranslations('admin.newSeason')
  const tc = useTranslations('admin.common')
  const tv = useTranslations('validation')
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
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewSeasonSchema>({
    resolver: zodResolver(createNewSeasonSchema(tv)),
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
    const stats = getValues('stats') ?? []

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
    const updatedStats = [
      ...stats.filter((s) => !removedTracking.includes(s)),
      ...addedTracking.filter((s) => !stats.includes(s)),
    ]

    if (
      updatedBadges.length !== badges.length ||
      updatedBadges.some((s, i) => s !== badges[i])
    ) {
      setValue('badges', updatedBadges)
    }
    if (
      updatedStats.length !== stats.length ||
      updatedStats.some((s, i) => s !== stats[i])
    ) {
      setValue('stats', updatedStats)
    }

    prevTrackingRef.current = newTracking
  }, [beamsValue, getTrackingSymbols, getValues, setValue])

  async function onSubmit({
    name,
    symbol,
    beams,
    badges,
    stats,
  }: NewSeasonSchema) {
    try {
      const orgBadgeSymbols = (badgesQuery.data?.rows ?? []).map(
        (b) => b.badge_symbol
      )
      const beamBadgeSymbols = beams?.length
        ? getBeamWithTrackingBadges(beams, orgBadgeSymbols)
        : []
      const allBadgeSymbols = [...badges, ...beamBadgeSymbols]

      await createSeason({
        session: session!,
        agg_symbol: addOrganizationSymbol(symbol),
        badge_symbols: allBadgeSymbols,
        stats_badge_symbols: stats,
        ipfs_image: '',
        display_name: name,
        description: '',
      })
      const aggSymbol = `0,${addOrganizationSymbol(symbol)}`
      toast.success(t('createSuccess'))
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.refetchQueries({ queryKey: ['seasons', orgName] })
      router.push(`/admin/seasons/${aggSymbol}`)
    } catch {
      toast.error(t('createFailed'))
    }
  }

  return (
    <Box className="p-0 max-md:rounded-none max-md:border-0 max-md:bg-black">
      {badgesQuery.isSuccess && badgesQuery.data.rows.length === 0 && (
        <div className="bg-gray-2 border-gray-3 m-8 mb-0 rounded-lg border p-4 max-md:mx-0">
          <p className="text-body-2 text-gray-4">
            {t('noBadges')}{' '}
            <Link
              href="/admin/new-badge"
              className="text-white underline"
            >
              {t('createBadge')}
            </Link>{' '}
            {t('toGetStarted')}
          </p>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-md:p-0"
      >
        <Field>
          <Label htmlFor="name">{tc('name')}</Label>
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
              <Label htmlFor="symbol">{tc('symbol')}</Label>
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
          name="beams"
          control={control}
          render={({ field }) => (
            <Field>
              <Label>{t('beams')}</Label>
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
              <Label htmlFor="badges">{t('badges')}</Label>
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
              <Label htmlFor="stats">{t('statsBadges')}</Label>
              <InputBadges value={field.value} onChange={field.onChange} />
              <ErrorMessage>{errors['stats']?.message}</ErrorMessage>
            </Field>
          )}
        />
        <Button type="submit" variant="primary" size="lg">
          {isSubmitting ? tc('creating') : tc('create')}
        </Button>
      </form>
    </Box>
  )
}
