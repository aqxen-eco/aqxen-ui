"use server";

import { type Badge, getBadgesService } from "@/services/get-badges-service";

type GetBadges = {
  rows: Badge[];
  more: boolean;
};

export async function getBadges(): Promise<GetBadges> {
  const { rows, more } = await getBadgesService();

  return {
    rows,
    more,
  };
}
