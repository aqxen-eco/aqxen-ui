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
import { ErrorMessage, Field, Label } from '@/components/ui/field'

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
                  <Label htmlFor="badges">Badges</Label>
                  <InputBadges value={field.value} onChange={field.onChange} />
                  <ErrorMessage>{errors['badges']?.message}</ErrorMessage>
                </Field>
              )}
            />
            <Field>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                {...register('amount')}
                placeholder="uint64"
                aria-invalid={!!errors['amount']}
              />
              <ErrorMessage>{errors['amount']?.message}</ErrorMessage>
            </Field>
            <Field>
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                {...register('to')}
                placeholder="name"
                aria-invalid={!!errors['to']}
              />
              <ErrorMessage>{errors['to']?.message}</ErrorMessage>
            </Field>
            <Field>
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                {...register('message')}
                placeholder="String"
                aria-invalid={!!errors['message']}
              />
              <ErrorMessage>{errors['message']?.message}</ErrorMessage>
            </Field>
            <Button type="submit" variant="primary" size="lg">
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </Box>
      </div>
    </>
  )
}
