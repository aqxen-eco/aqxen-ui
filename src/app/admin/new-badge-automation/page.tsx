'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MdClose } from 'react-icons/md'
import { toast } from 'react-toastify'
import z from 'zod'

import { listBadge } from '@/api/chain/badge/list-badge'
import { createBadgeAutomation } from '@/api/chain/badge-automation/create-badge-automation'
import { disableBadgeAutomation } from '@/api/chain/badge-automation/disable-badge-automation'
import { listBadgeAutomation } from '@/api/chain/badge-automation/list-badge-automation'
import { Badge } from '@/api/model/badge'
import { BadgeImage } from '@/components/ui/badge-image'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxWrapper } from '@/components/ui/checkbox'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputSearchBadges } from '@/components/ui/input-search-badges'
import { InputSymbol } from '@/components/ui/input-symbol'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { useTranslateBadgeName } from '@/hooks/use-translate-badge-name'
import { numberMask } from '@/utils/masks'

function createNewBadgeAutomationSchema(t: (key: string) => string) {
  return z.object({
    display_name: z.string().nonempty(t('nameRequired')),
    emission_symbol: z.string().length(3, t('symbolRequired')),
    criteria: z
      .object({
        badge_symbol: z.string().nonempty(t('badgeRequired')),
        quantity: z.string().nonempty(t('quantityRequired')),
      })
      .array()
      .nonempty({
        message: t('cantBeEmpty'),
      }),
    emitted: z
      .array(
        z.object({
          badge_symbol: z.string().nonempty(t('badgeRequired')),
          quantity: z.string().nonempty(t('quantityRequired')),
        })
      )
      .nonempty({
        message: t('cantBeEmpty'),
      }),
    cyclic: z.boolean(),
  })
}

type NewBadgeAutomationSchema = z.infer<
  ReturnType<typeof createNewBadgeAutomationSchema>
>

export default function NewBadgeAutomationPage() {
  const t = useTranslations('admin.newBadgeAutomation')
  const tc = useTranslations('admin.common')
  const tv = useTranslations('validation')
  const { symbol: organizationSymbol, name: orgName } = useOrganization()
  const translateBadgeName = useTranslateBadgeName()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { actor, session } = useChain()

  const editEmissionSymbol = searchParams.get('edit')
  const isEditMode = !!editEmissionSymbol

  const [badgesCriteria, setBadgesCriteria] = useState<Badge[]>([])
  const [badgesEmitted, setBadgesEmitted] = useState<Badge[]>([])
  const [hasLoadedEdit, setHasLoadedEdit] = useState(false)

  const badgesQuery = useQuery({
    queryKey: ['badges', orgName],
    queryFn: async () => await listBadge({ scope: orgName }),
    enabled: !!orgName,
  })

  const automationQuery = useQuery({
    queryKey: ['badge-automation-edit', editEmissionSymbol],
    queryFn: async () => await listBadgeAutomation({ scope: actor }),
    enabled: isEditMode && !!actor,
  })

  const badgesCriteriaValue = badgesCriteria.reduce(
    (acc: string[], crr) => [...acc, crr.badge_symbol],
    []
  )

  const badgesEmittedValue = badgesEmitted.reduce(
    (acc: string[], crr) => [...acc, crr.badge_symbol],
    []
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewBadgeAutomationSchema>({
    resolver: zodResolver(createNewBadgeAutomationSchema(tv)),
  })

  useEffect(() => {
    if (
      !isEditMode ||
      hasLoadedEdit ||
      !automationQuery.data ||
      !badgesQuery.data
    )
      return

    const automation = automationQuery.data.rows.find(
      (r) => r.emission_symbol === editEmissionSymbol
    )
    if (!automation) return

    const allBadges = badgesQuery.data.rows
    const symbolSuffix = editEmissionSymbol
      .split(',')[1]
      .replace(organizationSymbol.toUpperCase(), '')

    const criteriaBadges: Badge[] = []
    const criteriaValues: { badge_symbol: string; quantity: string }[] = []
    for (const c of automation.emitter_criteria) {
      const [quantity, sym] = c.value.split(' ')
      const badge = allBadges.find(
        (b) => b.badge_symbol.split(',')[1] === sym
      )
      if (badge) {
        criteriaBadges.push(badge)
        criteriaValues.push({
          badge_symbol: badge.badge_symbol,
          quantity,
        })
      }
    }

    const emittedBadges: Badge[] = []
    const emittedValues: { badge_symbol: string; quantity: string }[] = []
    for (const e of automation.emit_assets) {
      const [quantity, sym] = e.emit_asset.split(' ')
      const badge = allBadges.find(
        (b) => b.badge_symbol.split(',')[1] === sym
      )
      if (badge) {
        emittedBadges.push(badge)
        emittedValues.push({
          badge_symbol: badge.badge_symbol,
          quantity,
        })
      }
    }

    setBadgesCriteria(criteriaBadges)
    setBadgesEmitted(emittedBadges)
    reset({
      display_name: automation.onchain_lookup_data.user.name,
      emission_symbol: symbolSuffix,
      criteria: criteriaValues,
      emitted: emittedValues,
      cyclic: !!automation.cyclic,
    })
    setHasLoadedEdit(true)
  }, [
    isEditMode,
    hasLoadedEdit,
    automationQuery.data,
    badgesQuery.data,
    editEmissionSymbol,
    organizationSymbol,
    reset,
    setValue,
  ])

  async function onSubmit({
    display_name,
    emission_symbol,
    criteria,
    emitted,
    cyclic,
  }: NewBadgeAutomationSchema) {
    try {
      const emitter_criteria = criteria.map(
        (item) => `${item.quantity} ${item.badge_symbol.split(',')[1]}`
      )
      const emit_badges = emitted.map(
        (item) => `${item.quantity} ${item.badge_symbol.split(',')[1]}`
      )

      if (isEditMode) {
        const oldAutomation = automationQuery.data?.rows.find(
          (r) => r.emission_symbol === editEmissionSymbol
        )
        if (oldAutomation && oldAutomation.status === 'activate') {
          await disableBadgeAutomation({
            session: session!,
            emission_symbol: editEmissionSymbol,
          })
        }
      }

      await createBadgeAutomation({
        session: session!,
        display_name,
        ipfs_description: '',
        emission_symbol:
          `0,${organizationSymbol}${emission_symbol}`.toUpperCase(),
        emitter_criteria,
        emit_badges,
        cyclic,
      })

      toast.success(
        isEditMode
          ? t('updateSuccess')
          : t('createSuccess')
      )
      router.push('/admin/badges-automation')
    } catch {
      toast.error(
        isEditMode
          ? t('updateFailed')
          : t('createFailed')
      )
    }
  }

  return (
    <Box className="p-0 max-md:rounded-none max-md:border-0 max-md:bg-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-md:p-0"
      >
        <Field>
          <Label htmlFor="display_name">{tc('name')}</Label>
          <Input
            id="display_name"
            {...register('display_name')}
            aria-invalid={!!errors['display_name']}
          />
          <ErrorMessage>{errors['display_name']?.message}</ErrorMessage>
        </Field>
        <Controller
          name="emission_symbol"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="emission_symbol">{tc('symbol')}</Label>
              <InputSymbol
                id="emission_symbol"
                aria-invalid={!!errors['emission_symbol']}
                maxLength={3}
                {...field}
              />
              <ErrorMessage>{errors['emission_symbol']?.message}</ErrorMessage>
            </Field>
          )}
        />

        <Field className="space-y-2">
          <Label>{t('badgesCriteria')}</Label>
          <ul>
            {badgesCriteria.map((badge, badgeIndex) => (
              <li
                key={badge.badge_symbol}
                className="border-gray-2 flex justify-center gap-4 border-b py-1"
              >
                <div className="flex flex-1 items-center gap-2">
                  <BadgeImage
                    src={badge.offchain_lookup_data.user.ipfs_image}
                    size="xs"
                    badgeSymbol={badge.badge_symbol}
                    displayName={badge.onchain_lookup_data.user.display_name}
                  />
                  <input
                    type="hidden"
                    {...register(`criteria.${badgeIndex}.badge_symbol`)}
                    value={badge.badge_symbol}
                  />
                  <span className="text-body-2 font-sans font-medium text-nowrap text-white">
                    {translateBadgeName(badge.onchain_lookup_data.user.display_name)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body-2 text-gray-3">{t('qty')}</span>
                    <input
                      type="text"
                      className="placeholder-gray-3 h-10 w-full bg-transparent focus:outline-0"
                      placeholder={t('quantityPlaceholder')}
                    {...register(`criteria.${badgeIndex}.quantity`, {
                      onChange: (event) => {
                        event.target.value = numberMask(event.target.value)
                      },
                    })}
                    />
                  </div>
                </div>
                <div className="flex-none">
                  <Button
                    size="md"
                    variant="link"
                    square
                    onClick={() => {
                      setBadgesCriteria((state) =>
                        state.filter(
                          (b) => b.badge_symbol !== badge.badge_symbol
                        )
                      )
                    }}
                  >
                    <MdClose className="size-6" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <InputSearchBadges
            value={badgesCriteriaValue}
            onChange={(value) => {
              setBadgesCriteria(value)
            }}
          />
          <ErrorMessage>{errors['criteria']?.message}</ErrorMessage>
        </Field>

        <Field className="space-y-2">
          <Label>{t('badgesEmitted')}</Label>
          <ul>
            {badgesEmitted.map((badge, badgeIndex) => (
              <li
                key={badge.badge_symbol}
                className="border-gray-2 flex justify-center gap-4 border-b py-1"
              >
                <div className="flex flex-1 items-center gap-2">
                  <BadgeImage
                    src={badge.offchain_lookup_data.user.ipfs_image}
                    size="xs"
                    badgeSymbol={badge.badge_symbol}
                    displayName={badge.onchain_lookup_data.user.display_name}
                  />
                  <input
                    type="hidden"
                    {...register(`emitted.${badgeIndex}.badge_symbol`)}
                    value={badge.badge_symbol}
                  />
                  <span className="text-body-2 font-sans font-medium text-nowrap text-white">
                    {translateBadgeName(badge.onchain_lookup_data.user.display_name)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body-2 text-gray-3">{t('qty')}</span>
                    <input
                      type="text"
                      className="placeholder-gray-3 h-10 w-full bg-transparent focus:outline-0"
                      placeholder={t('quantityPlaceholder')}
                    {...register(`emitted.${badgeIndex}.quantity`, {
                      onChange: (event) => {
                        event.target.value = numberMask(event.target.value)
                      },
                    })}
                    />
                  </div>
                </div>
                <div className="flex-none">
                  <Button
                    size="md"
                    variant="link"
                    square
                    onClick={() => {
                      setBadgesEmitted((state) =>
                        state.filter(
                          (b) => b.badge_symbol !== badge.badge_symbol
                        )
                      )
                    }}
                  >
                    <MdClose className="size-6" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <InputSearchBadges
            value={badgesEmittedValue}
            onChange={(value) => {
              setBadgesEmitted(value)
            }}
          />
          <ErrorMessage>{errors['emitted']?.message}</ErrorMessage>
        </Field>

        <Field>
          <CheckboxWrapper>
            <Label htmlFor="cyclic" className="flex-1">
              {tc('cyclic')}
            </Label>
            <Checkbox
              id="cyclic"
              {...register('cyclic')}
              aria-invalid={!!errors['cyclic']}
            />
          </CheckboxWrapper>
          <ErrorMessage>{errors['cyclic']?.message}</ErrorMessage>
        </Field>

        <Button type="submit" variant="primary" size="lg">
          {isSubmitting
            ? isEditMode
              ? tc('saving')
              : tc('creating')
            : isEditMode
              ? tc('save')
              : tc('create')}
        </Button>
      </form>
    </Box>
  )
}
