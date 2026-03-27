import { listOrganization } from '@/api/chain/organization/list-organization'

import { requireAuth } from './require-auth'

export async function requireOrgAdmin(): Promise<string> {
  const actor = await requireAuth()

  const { rows } = await listOrganization({
    lower_bound: actor,
    upper_bound: actor,
  })

  if (!rows[0]?.org) {
    throw new Error('Forbidden')
  }

  return actor
}
