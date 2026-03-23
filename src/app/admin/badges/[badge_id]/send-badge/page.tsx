'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MdClose } from 'react-icons/md'
import { toast } from 'react-toastify'
import z from 'zod'

import { sendBadge } from '@/api/chain/badge/send-badge'
import { listMembers } from '@/api/chain/organization/list-members'
import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxEmpty,
  ComboboxItem,
} from '@/components/ui/combobox'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputBadges } from '@/components/ui/input-badges'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { numberMask } from '@/utils/masks'

const sendBadgeSchema = z.object({
  badges: z.string().array().min(1, 'Badges is required'),
  amount: z.string().min(1, 'Amount is required'),
  to: z.string().min(1, 'To is required'),
  message: z.string().min(1, 'Message is required'),
})

type SendBadgeSchema = z.infer<typeof sendBadgeSchema>

export default function SendBadgePage() {
  const t = useTranslations('admin.sendBadge')
  const tc = useTranslations('admin.common')
  const tn = useTranslations('admin.nav')
  const params = useParams()
  const { session } = useChain()
  const router = useRouter()
  const { name, removeOrganizationSymbol } = useOrganization()

  const badgeIdDecoded = decodeURIComponent(params.badge_id as string)

  const membersQuery = useQuery({
    queryKey: ['members', name],
    queryFn: () => listMembers({ scope: name }),
    enabled: !!name,
  })

  const members = useMemo(
    () => membersQuery.data?.rows ?? [],
    [membersQuery.data]
  )

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SendBadgeSchema>({
    resolver: zodResolver(sendBadgeSchema),
    defaultValues: {
      badges: [badgeIdDecoded],
    },
  })

  async function onSubmit({ badges, amount, to, message }: SendBadgeSchema) {
    try {
      await sendBadge({
        session: session!,
        badge_symbol: badges[0],
        amount: Number(amount),
        to,
        memo: message,
      })
      toast.success(t('sendSuccess'))
      router.push('/admin/badges')
    } catch {
      toast.error(t('sendFailed'))
    }
  }

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/badges">{tn('badges')}</HeaderAdminBack>
        <HeaderAdminTitle
          title={
            <>
              {t('title')}{' '}
              <span className="text-gray-3">
                ({removeOrganizationSymbol(badgeIdDecoded)})
              </span>
            </>
          }
          tooltip="Lorem ipsum dolor sit amed"
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto min-h-[calc(100vh-24rem)] space-y-8 px-4 pb-8">
        <Box className="p-0 max-md:rounded-none max-md:border-0 max-md:bg-black">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 p-8 max-md:p-0"
          >
            <Controller
              name="badges"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label htmlFor="badges">{tn('badges')}</Label>
                  <InputBadges
                    value={field.value}
                    onChange={field.onChange}
                    hideSearch
                    hideRemoveBadgeButton
                  />
                  <ErrorMessage>{errors['badges']?.message}</ErrorMessage>
                </Field>
              )}
            />
            <Field>
              <Label htmlFor="amount">{t('amount')}</Label>
              <Input
                id="amount"
                {...register('amount', {
                  onChange: (event) => {
                    event.target.value = numberMask(event.target.value)
                  },
                })}
                placeholder="uint64"
                aria-invalid={!!errors['amount']}
              />
              <ErrorMessage>{errors['amount']?.message}</ErrorMessage>
            </Field>
            <Controller
              name="to"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label htmlFor="to">{t('to')}</Label>
                  <Combobox
                    title={t('searchMembers')}
                    closeOnSelect
                    triggerContent={
                      field.value ? (
                        <div
                          className="border-gray-2 bg-gray-2 inline-flex h-7 items-center gap-2 rounded-full border py-1 pr-1 pl-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Avatar size="xs">
                            {field.value.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <span className="text-body-2 font-medium text-white">
                            {field.value}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              field.onChange('')
                            }}
                            className="text-gray-3 hover:text-white p-0.5"
                          >
                            <MdClose className="size-4" />
                          </button>
                        </div>
                      ) : null
                    }
                    filter={(value, search) => {
                      if (
                        value
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                        return 1
                      return 0
                    }}
                  >
                    <ComboboxEmpty />
                    {members.map((member) => (
                      <ComboboxItem
                        key={member.account}
                        value={member.account}
                        onSelect={(value) => {
                          field.onChange(
                            field.value === value ? '' : value
                          )
                        }}
                        checked={field.value === member.account}
                      >
                        <span className="flex items-center gap-2">
                          <Avatar size="xs">
                            {member.account
                              .slice(0, 2)
                              .toUpperCase()}
                          </Avatar>
                          {member.account}
                        </span>
                      </ComboboxItem>
                    ))}
                  </Combobox>
                  <ErrorMessage>{errors['to']?.message}</ErrorMessage>
                </Field>
              )}
            />
            <Field>
              <Label htmlFor="message">{t('message')}</Label>
              <Input
                id="message"
                {...register('message')}
                placeholder="String"
                aria-invalid={!!errors['message']}
              />
              <ErrorMessage>{errors['message']?.message}</ErrorMessage>
            </Field>
            <Button type="submit" variant="primary" size="lg">
              {isSubmitting ? tc('sending') : tc('send')}
            </Button>
          </form>
        </Box>
      </div>
    </>
  )
}
