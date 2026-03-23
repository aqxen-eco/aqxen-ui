'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'

import { Button } from '@/components/ui/button'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { sendContactEmail } from './functions'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Email is invalid'),
  organizationName: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

export type ContactSchema = z.infer<typeof contactSchema>

export default function Contact() {
  const t = useTranslations('contact')
  const tc = useTranslations('common')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit({
    name,
    email,
    organizationName,
    message,
  }: ContactSchema) {
    const result = await sendContactEmail({
      name,
      email,
      organizationName,
      message,
    })

    if (!result.error) {
      reset()
      toast.success(t('successToast'))
    } else {
      toast.error(t('errorToast'))
    }
  }

  return (
    <>
      <header className="max-w-container-md relative mx-auto overflow-hidden px-4 py-16">
        <div className="space-y-6 md:text-center">
          <h1 className="text-display-1 max-md:text-display-2 text-white">
            {t('heading')}
          </h1>
          <p className="text-body-1 text-gray-3">{t('description')}</p>
        </div>
      </header>
      <div className="max-w-container-md mx-auto px-4 py-16">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 p-8 max-md:p-0"
        >
          <Field>
            <Label htmlFor="name">{t('nameLabel')}</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('namePlaceholder')}
              aria-invalid={!!errors['name']}
            />
            <ErrorMessage>{errors['name']?.message}</ErrorMessage>
          </Field>
          <Field>
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder={t('emailPlaceholder')}
              aria-invalid={!!errors['email']}
            />
            <ErrorMessage>{errors['email']?.message}</ErrorMessage>
          </Field>
          <Field>
            <Label htmlFor="organizationName">{t('orgLabel')}</Label>
            <Input
              id="organizationName"
              {...register('organizationName')}
              placeholder={t('orgPlaceholder')}
              aria-invalid={!!errors['organizationName']}
            />
            <ErrorMessage>{errors['organizationName']?.message}</ErrorMessage>
          </Field>
          <Field>
            <Label htmlFor="message">{t('messageLabel')}</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder={t('messagePlaceholder')}
              aria-invalid={!!errors['message']}
            />
            <ErrorMessage>{errors['message']?.message}</ErrorMessage>
          </Field>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? tc('submitting') : tc('submit')}
          </Button>
        </form>
      </div>
    </>
  )
}
