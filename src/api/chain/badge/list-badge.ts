import {
  BADGES_INFO_CONTRACT,
  IPFS_IMAGE_SOURCE,
  ORG,
  ORG_SYMBOL,
  Table,
} from "@/constants";
import { jungleClient } from "@/api/chain/jungle-client";
import type { ListBadgeResult } from '@/api/model/badge'
import { safeParse } from "@/utils/safe-parse";

type GetBadgesServiceProps = {
  scope?: string;
};

export async function listBadge(
  props?: GetBadgesServiceProps,
): Promise<ListBadgeResult> {
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
    ipfs: IPFS_IMAGE_SOURCE + safeParse(row.offchain_lookup_data).img,
    name: safeParse(row.onchain_lookup_data).name,
    notify_accounts: row.notify_accounts,
    rarity_counts: row.rarity_counts,
  }))

  return {
    rows,
    more
  };
}
