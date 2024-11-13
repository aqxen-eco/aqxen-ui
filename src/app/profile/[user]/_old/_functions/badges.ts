import {
  BADGES_INFO_CONTRACT,
  I64,
  ORG,
  ORG_SYMBOL,
  Table,
  USER_BADGES_CONTRACT,
} from "@/constants";

import { jungleClient } from "@/jungle-client";
import type {
  BadgeFilterType,
  BadgeResponse,
  BadgeType,
  BadgesFilter,
  Bound,
  OrgBadgeResponse,
} from "../_models/badges";
import { BadgeFilterType as BadgeFilterEnum } from "../_models/badges";
import type { IndexPosition } from "../_models/types";

const KEY_TYPE: Record<BadgeFilterType, string> = {
  [BadgeFilterEnum.DEFAULT]: I64,
};

const INDEX_POSITION: Record<BadgeFilterType, IndexPosition> = {
  [BadgeFilterEnum.DEFAULT]: "primary",
};

export async function getOrgBadges({
  queryType,
}: BadgesFilter): Promise<OrgBadgeResponse> {
  const { rows, next_key, more } = await jungleClient.v1.chain.get_table_rows({
    code: BADGES_INFO_CONTRACT,
    scope: ORG,
    table: Table.BADGE,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    limit: 1000,
  });

  console.debug("Org Badges");
  console.debug(rows);

  return {
    more,
    rows,
    next_key: next_key ? next_key.toString() : null,
  };
}

export async function getUserBadges({
  scope,
  queryType,
  lowerBound,
  upperBound,
}: BadgesFilter): Promise<BadgeResponse> {
  const { rows, next_key, more } = await jungleClient.v1.chain.get_table_rows({
    code: USER_BADGES_CONTRACT,
    scope: scope,
    table: Table.ACCOUNTS,
    json: true,
    ...(queryType != null ? { key_type: KEY_TYPE[queryType] } : {}),
    ...(queryType != null ? { index_position: INDEX_POSITION[queryType] } : {}),
    ...(lowerBound != null
      ? { lower_bound: lowerBound as unknown as Bound }
      : {}),
    ...(upperBound != null
      ? { upper_bound: upperBound as unknown as Bound }
      : {}),
    limit: 1000,
  });

  console.debug("User Lifetime Badges");
  console.debug(rows);

  // TODO: Tech Debt. There should be a way to filter or scope this request from the blockchain.
  // In the future, with many different orgs and badges, this could easily get too cluttered.
  const orgRows = rows.filter((row) => row.balance.includes(ORG_SYMBOL));

  console.debug("User Lifetime Badges (Org Filtered)");
  console.debug(orgRows);

  return {
    more,
    rows: orgRows,
    next_key: next_key ? next_key.toString() : null,
  };
}
