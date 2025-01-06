"use client"

import { Session } from '@wharfkit/session';
import { createBadge } from "@/api/chain/badge";

type NewBadgeProps = {
  session?: Session;
  name: string;
  symbol: string;
  image: string;
  description: string;
  lifetimeAggregate: boolean;
  lifetimeStats: boolean;
};

export async function newBadge({
  session,
  name,
  symbol,
  image,
  description,
  lifetimeAggregate,
  lifetimeStats,
}: NewBadgeProps) {
  if (!session) return;

  await createBadge({
    session,
    badge_symbol: `0,ALEX${symbol.toUpperCase()}`,
    offchain_lookup_data: `{"img":"${image}"}`,
    onchain_lookup_data: `{"name":"${name}"}`,
    lifetime_aggregate: lifetimeAggregate,
    lifetime_stats: lifetimeStats,
    memo: description
  })
}