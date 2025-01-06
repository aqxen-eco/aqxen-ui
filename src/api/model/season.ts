import { GetTableRowsResult } from "./index";

export type Season = {
  id: string;
  symbol: string;
  name: string;
  badges: string[];
  last_created_series: number[];
  last_started_series: number[];
  last_ended_series: number[];
};

export type ListSeasonResult = GetTableRowsResult<Season>