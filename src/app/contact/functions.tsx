'use server'

import { Resend } from 'resend'

import { ContactSchema } from './page'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail({
  name,
  email,
  organizationName,
  message,
}: ContactSchema) {
  try {
    return resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'delivered@resend.dev',
      to: process.env.RESEND_TO_EMAIL || 'delivered@resend.dev',
      subject: 'Contact form',
      html: `<p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <p>Organization Name: ${organizationName}</p>
      <p>Message: ${message}</p>`,
    })
  } catch {
    return {
      error: true,
    }
  }
}
