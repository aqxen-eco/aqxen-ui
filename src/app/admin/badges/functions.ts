"use server";

import { listBadge, type ListBadgeResult } from '@/api/chain/badge'

export async function getBadges(): Promise<ListBadgeResult> {
  const { rows, more, next_key } = await listBadge();

  return {
    rows,
    more,
    next_key
  };
}
