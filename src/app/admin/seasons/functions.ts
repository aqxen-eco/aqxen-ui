"use server";

import { GetTableRowsResult } from '@/api/model'

import { listBadge, type Badge } from '@/api/chain/badge'
import { listSeries, type Series } from '@/api/chain/series'
import { listSeason } from '@/api/chain/season'

type Season = {
  id: string;
  symbol: string;
  name: string;
  badges: Badge[];
  last_created_series: Series[];
  last_started_series: Series[];
  last_ended_series: Series[];
};

export async function getSeasons(): Promise<GetTableRowsResult<Season>> {
  const [seasons, badges] = await Promise.all([
    listSeason(),
    listBadge(),
  ]);

  const seriesPerSeason = await Promise.all(
    seasons.rows.map((season) => listSeries({ season_id: season.id })),
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
