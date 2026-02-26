'use server'

import { Resend } from 'resend'

import { createRateLimiter } from '@/lib/rate-limit'
import { contactSchema } from '@/lib/schemas'

const resend = new Resend(process.env.RESEND_API_KEY)

const contactLimiter = createRateLimiter({ windowMs: 60_000, max: 3 })

type ContactInput = {
  name: string
  email: string
  organizationName?: string
  message: string
}

export async function sendContactEmail(input: ContactInput) {
  try {
    const { name, email, organizationName, message } =
      contactSchema.parse(input)

    const limit = contactLimiter.check(email)
    if (!limit.ok) {
      return { error: true }
    }

    return resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'delivered@resend.dev',
      to: process.env.RESEND_TO_EMAIL || 'delivered@resend.dev',
      subject: 'Contact form',
      text: `Name: ${name}\nEmail: ${email}\nOrganization Name: ${organizationName ?? 'N/A'}\nMessage: ${message}`,
    })
  } catch {
    return {
      error: true,
    }
  }
}
