import { ORG, ORG_SYMBOL, SEASONS_INFO_CONTRACT, Table } from "@/constants";
import { jungleClient } from "@/api/chain/jungle-client";

import type { ListSeasonResult } from '@/api/model/season'

type GetSeasonsServiceProps = {
  scope?: string;
};

export async function listSeason(
  props?: GetSeasonsServiceProps,
): Promise<ListSeasonResult> {
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
