import { getSession } from './session'

export async function requireAuth(): Promise<string> {
  const session = await getSession()

  if (!session.actor) {
    throw new Error('Unauthorized')
  }

  return session.actor
}
