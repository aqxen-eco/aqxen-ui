'use server'

import { ensurePinataGroupByName } from '@/api/pinata/create-group'
import { requireOrgAdmin } from '@/lib/require-org-admin'

export async function ensureOrgPinataGroup(orgName: string) {
  await requireOrgAdmin()
  return await ensurePinataGroupByName(`org-${orgName}`)
}

export async function ensureOrgBadgePinataGroup(orgName: string) {
  await requireOrgAdmin()
  return await ensurePinataGroupByName(`org-${orgName}-badges`)
}

export async function ensureOrgBeamsPinataGroup(orgName: string) {
  await requireOrgAdmin()
  return await ensurePinataGroupByName(`org-${orgName}-beams`)
}
