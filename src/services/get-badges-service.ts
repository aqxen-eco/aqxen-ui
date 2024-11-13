import {
  BADGES_INFO_CONTRACT,
  IPFS_IMAGE_SOURCE,
  ORG,
  ORG_SYMBOL,
  Table,
} from "@/constants";
import { jungleClient } from "@/jungle-client";

export type Badge = {
  id: string;
  symbol: string;
  ipfs: string;
  name: string;
  notify_accounts: string[];
  rarity_counts: string;
};

type GetBadgesServiceProps = {
  scope?: string;
};

type GetBadgesService = {
  rows: Badge[];
  more: boolean;
};

export async function getBadgesService(
  props?: GetBadgesServiceProps,
): Promise<GetBadgesService> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: BADGES_INFO_CONTRACT,
    scope: props?.scope ?? ORG,
    table: Table.BADGE,
    json: true,
    limit: 1000,
  });

  rows = rows.map((row) => ({
    id: row.badge_symbol,
    symbol: row.badge_symbol.split(",")[1].replace(ORG_SYMBOL, ""),
    ipfs: IPFS_IMAGE_SOURCE + JSON.parse(row.offchain_lookup_data).img,
    name: JSON.parse(row.onchain_lookup_data).name,
    notify_accounts: row.notify_accounts,
    rarity_counts: row.rarity_counts,
  }));

  return {
    rows,
    more,
  };
}
