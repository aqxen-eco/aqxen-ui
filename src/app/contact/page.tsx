'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sendContactEmail } from './functions'
import { toast } from 'react-toastify'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Email is invalid'),
  organizationName: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

export type ContactSchema = z.infer<typeof contactSchema>

export default function Contact() {
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
      toast.success('Email sent successfully')
    } else {
      toast.error('Failed to send email')
    }
  }

  return (
    <>
      <header className="max-w-container-md relative mx-auto overflow-hidden px-4 py-16">
        <div className="space-y-6 md:text-center">
          <h1 className="text-display-1 max-md:text-display-2 text-white">
            Let's Connect
          </h1>
          <p className="text-body-1 text-gray-3">
            We’re here to help you understand how AqXen Socials can transform
            your community's productivity and positivity. Reach out with any
            questions about unlocking access, features, or partnership
            opportunities.
          </p>
        </div>
      </header>
      <div className="max-w-container-md mx-auto px-4 py-16">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 p-8 max-md:p-0"
        >
          <Field>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Your name"
              aria-invalid={!!errors['name']}
            />
            <ErrorMessage>{errors['name']?.message}</ErrorMessage>
          </Field>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@company.com"
              aria-invalid={!!errors['email']}
            />
            <ErrorMessage>{errors['email']?.message}</ErrorMessage>
          </Field>
          <Field>
            <Label htmlFor="organizationName">
              Organization Name (optional)
            </Label>
            <Input
              id="organizationName"
              {...register('organizationName')}
              placeholder="Your organization"
              aria-invalid={!!errors['organizationName']}
            />
            <ErrorMessage>{errors['organizationName']?.message}</ErrorMessage>
          </Field>
          <Field>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="How can we help?"
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
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </>
  )
}
