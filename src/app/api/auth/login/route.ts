import { NextResponse } from 'next/server'

import { eosActorSchema } from '@/lib/schemas'
import { getSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = eosActorSchema.safeParse(body.actor)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid actor' },
        { status: 400 },
      )
    }

    const session = await getSession()
    session.actor = result.data
    await session.save()

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 },
    )
  }
}
