import { ORG, ORG_SYMBOL, SEASONS_INFO_CONTRACT, Table } from "@/constants";
import { jungleClient } from "@/jungle-client";

export type Season = {
  id: string;
  symbol: string;
  name: string;
  badges: string[];
  last_created_series: number[];
  last_started_series: number[];
  last_ended_series: number[];
};

type GetSeasonsServiceProps = {
  scope?: string;
};

type GetSeasonsService = {
  rows: Season[];
  more: boolean;
};

export async function getSeasonsService(
  props?: GetSeasonsServiceProps,
): Promise<GetSeasonsService> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: SEASONS_INFO_CONTRACT,
    scope: props?.scope ?? ORG,
    table: Table.AGGREGATES,
    json: true,
    limit: 1000,
  });

  rows = rows.map((row) => ({
    id: row.agg_symbol,
    symbol: row.agg_symbol.split(",")[1].replace(ORG_SYMBOL, ""),
    name: row.agg_description,
    badges: row.init_badge_symbols,
    last_created_series: row.init_seq_ids,
    last_started_series: row.active_seq_ids,
    last_ended_series: row.end_seq_ids,
  }));

  return {
    rows,
    more,
  };
}
