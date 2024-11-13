"use server";

import { type Badge, getBadgesService } from "@/services/get-badges-service";
import { type Season, getSeasonsService } from "@/services/get-seasons-service";

type GetUserBadgesProps = {
  user: string;
};

export type Seasons = Array<
  {
    badges: Badge[];
  } & Omit<Season, "badges">
>;

type GetUserBadges = {
  badges: Badge[];
  seasons: Seasons;
};

export async function getUserBadges({
  user,
}: GetUserBadgesProps): Promise<GetUserBadges> {
  const { rows: userBadges, more: userBadgesMore } = await getBadgesService({
    scope: user,
  });

  const { rows, more: userSeasonsMore } = await getSeasonsService({
    scope: user,
  });

  const userSeasons = rows.map((row) => ({
    ...row,
    badges: userBadges.filter((userBadge) => row.badges.includes(userBadge.id)),
  }));

  return {
    badges: userBadges,
    seasons: userSeasons,
  };
}
