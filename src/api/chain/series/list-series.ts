import { SEASONS_INFO_CONTRACT, Table } from "@/constants";
import { jungleClient } from "@/api/chain/jungle-client";

import type { ListSeriesResult } from '@/api/model/series'

type GetSeriesServiceProps = {
  season_id: string;
};

export async function listSeries(
  props: GetSeriesServiceProps,
): Promise<ListSeriesResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: SEASONS_INFO_CONTRACT,
    scope: props.season_id.split(",")[1],
    table: Table.SEQUENCES,
    json: true,
    limit: 1000,
  });

  rows = rows.map((row) => ({
    id: row.seq_id,
    status: row.seq_status,
    name: row.sequence_description,
    init_time: row.init_time,
    active_time: row.active_time,
    end_time: row.end_time,
  }));

  return {
    rows,
    more,
  };
}
