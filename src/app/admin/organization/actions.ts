'use server'

import { ensurePinataGroupByName } from '@/api/pinata/create-group'

export async function ensureOrgPinataGroup(orgName: string) {
  return await ensurePinataGroupByName(`org-${orgName}`)
}

export async function ensureOrgBadgePinataGroup(orgName: string) {
  return await ensurePinataGroupByName(`org-${orgName}-badges`)
}

export async function ensureOrgBeamsPinataGroup(orgName: string) {
  return await ensurePinataGroupByName(`org-${orgName}-beams`)
}
