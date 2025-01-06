import {
  ORGANIZATION_INFO_CONTRACT,
  IPFS_IMAGE_SOURCE,
  ORG,
  ORG_SYMBOL,
  Table,
} from "@/constants";
import { jungleClient } from "@/api/chain/jungle-client";
import type { ListBadgeResult } from '@/api/model/badge'
import { safeParse } from "@/utils/safe-parse";

export async function getOrganizationCode({ account }) {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: ORGANIZATION_INFO_CONTRACT,
    scope: 'organizayyyy',
    lower_bound: account,
    upper_bound: account,
    table: Table.ORGANIZATION_CODE,
    json: true,
    limit: 1,
  });
}