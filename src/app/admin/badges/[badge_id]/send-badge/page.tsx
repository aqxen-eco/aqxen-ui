'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { sendBadge } from '@/api/chain/badge/send-badge'
import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputBadges } from '@/components/ui/input-badges'
import { useChain } from '@/contexts/chain'

const sendBadgeSchema = z.object({
  badges: z.string().array().min(1, 'Badges is required'),
  amount: z.string().min(1, 'Amount is required'),
  to: z.string().min(1, 'To is required'),
  message: z.string().min(1, 'Message is required'),
})

type SendBadgeSchema = z.infer<typeof sendBadgeSchema>

export default function SendBadgePage() {
  const params = useParams()
  const { session } = useChain()
  const router = useRouter()

  const badgeIdDecoded = decodeURIComponent(params.badge_id as string)

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
        symbol: badges[0],
        amount: Number(amount),
        to,
        memo: message,
      })
      router.push('/admin/badges')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/badges">Badges</HeaderAdminBack>
        <HeaderAdminTitle
          title={
            <>
              Send badge
              {/* <span className="text-gray-3">({badgeIdDecoded})</span> */}
            </>
          }
          tooltip="Lorem ipsum dolor sit amed"
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="mx-auto min-h-[calc(100vh-24rem)] max-w-container-md space-y-8 px-4 pb-8">
        <Box className="p-0 mobile:rounded-none mobile:border-0 mobile:bg-black">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 p-8 mobile:p-0"
          >
            <Controller
              name="badges"
              control={control}
              render={({ field }) => (
                <InputBadges
                  value={field.value}
                  onChange={field.onChange}
                  error={errors['badges']?.message}
                />
              )}
            />
            <Input
              {...register('amount')}
              label="Amount"
              placeholder="uint64"
              error={errors['amount']?.message}
            />
            <Input
              {...register('to')}
              label="To"
              placeholder="name"
              error={errors['to']?.message}
            />
            <Input
              {...register('message')}
              label="Message"
              placeholder="String"
              error={errors['message']?.message}
            />
            <Button type="submit" variant="primary" size="lg">
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </Box>
      </div>
    </>
  )
}
