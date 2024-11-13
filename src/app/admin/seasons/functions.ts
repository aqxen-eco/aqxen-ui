"use server";

import { type Badge, getBadgesService } from "@/services/get-badges-service";
import { getSeasonsService } from "@/services/get-seasons-service";
import { type Series, getSeriesService } from "@/services/get-series-service";

type Row = {
  id: string;
  symbol: string;
  name: string;
  badges: Badge[];
  last_created_series: Series[];
  last_started_series: Series[];
  last_ended_series: Series[];
};

type GetSeasons = {
  rows: Row[];
  more: boolean;
};

export async function getSeasons(): Promise<GetSeasons> {
  const [seasons, badges] = await Promise.all([
    getSeasonsService(),
    getBadgesService(),
  ]);

  const seriesPerSeason = await Promise.all(
    seasons.rows.map((season) => getSeriesService({ season_id: season.id })),
  );

  const rows = seasons.rows.map((season, seasonIndex) => ({
    id: season.id,
    symbol: season.symbol,
    name: season.name,
    badges: badges.rows.filter((badgeRow) =>
      season.badges.includes(badgeRow.id),
    ),
    last_created_series: seriesPerSeason[seasonIndex].rows.filter((serie) =>
      season.last_created_series.includes(serie.id),
    ),
    last_started_series: seriesPerSeason[seasonIndex].rows.filter((serie) =>
      season.last_started_series.includes(serie.id),
    ),
    last_ended_series: seriesPerSeason[seasonIndex].rows.filter((serie) =>
      season.last_ended_series.includes(serie.id),
    ),
  }));

  return {
    rows,
    more: seasons.more,
  };
}
