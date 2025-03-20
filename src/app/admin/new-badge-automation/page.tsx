'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MdClose } from 'react-icons/md'
import z from 'zod'

import { createBadgeAutomation } from '@/api/chain/badge-automation/create-badge-automation'
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
import { numberMask } from '@/utils/masks'

const newBadgeAutomationSchema = z.object({
  display_name: z.string().nonempty('Name is required'),
  emission_symbol: z.string().length(3, 'Symbol is required'),
  criteria: z
    .object({
      badge_symbol: z.string().nonempty('Badge is required'),
      quantity: z.string().nonempty('Quantity is required'),
    })
    .array()
    .nonempty({
      message: "Can't be empty!",
    }),
  emitted: z
    .array(
      z.object({
        badge_symbol: z.string().nonempty('Badge is required'),
        quantity: z.string().nonempty('Quantity is required'),
      })
    )
    .nonempty({
      message: "Can't be empty!",
    }),
  cyclic: z.boolean(),
})

type NewBadgeAutomationSchema = z.infer<typeof newBadgeAutomationSchema>

export default function NewBadgeAutomationPage() {
  const { symbol: organizationSymbol } = useOrganization()
  const router = useRouter()
  const { session } = useChain()

  const [badgesCriteria, setBadgesCriteria] = useState<Badge[]>([])
  const [badgesEmitted, setBadgesEmitted] = useState<Badge[]>([])

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
    formState: { errors, isSubmitting },
  } = useForm<NewBadgeAutomationSchema>({
    resolver: zodResolver(newBadgeAutomationSchema),
  })

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

      router.push('/admin/badges-automation')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Box className="p-0 max-md:rounded-none max-md:border-0 max-md:bg-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-md:p-0"
      >
        <Field>
          <Label htmlFor="display_name">Name</Label>
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
              <Label htmlFor="emission_symbol">Symbol</Label>
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
          <Label>Badges criteria</Label>
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
                  />
                  <input
                    type="hidden"
                    {...register(`criteria.${badgeIndex}.badge_symbol`)}
                    value={badge.badge_symbol}
                  />
                  <span className="text-body-2 font-sans font-medium text-nowrap text-white">
                    {badge.onchain_lookup_data.user.display_name}
                  </span>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    className="placeholder-gray-3 h-10 w-full bg-transparent focus:outline-0"
                    placeholder="Quantity"
                    {...register(`criteria.${badgeIndex}.quantity`, {
                      onChange: (event) => {
                        event.target.value = numberMask(event.target.value)
                      },
                    })}
                  />
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
          <Label>Badges emitted</Label>
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
                  />
                  <input
                    type="hidden"
                    {...register(`emitted.${badgeIndex}.badge_symbol`)}
                    value={badge.badge_symbol}
                  />
                  <span className="text-body-2 font-sans font-medium text-nowrap text-white">
                    {badge.onchain_lookup_data.user.display_name}
                  </span>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    className="placeholder-gray-3 h-10 w-full bg-transparent focus:outline-0"
                    placeholder="Quantity"
                    {...register(`emitted.${badgeIndex}.quantity`, {
                      onChange: (event) => {
                        event.target.value = numberMask(event.target.value)
                      },
                    })}
                  />
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
              Cyclic
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
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </form>
    </Box>
  )
}
