import { ORGANIZATION_INFO_CONTRACT, Table } from "@/constants";
import { jungleClient } from "@/api/chain/jungle-client";
import { ListOrganizationResult } from "@/api/model/organization";
import { Name } from '@wharfkit/antelope';

type ListOrganizationProps = {
  lower_bound?: string;
  upper_bound?: string;
}

export async function listOrganization({ lower_bound, upper_bound }: ListOrganizationProps): Promise<ListOrganizationResult> {
  let { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: ORGANIZATION_INFO_CONTRACT,
    scope: ORGANIZATION_INFO_CONTRACT,
    lower_bound: lower_bound ? Name.from(lower_bound) : undefined,
    upper_bound: upper_bound ? Name.from(upper_bound) : undefined,
    table: Table.ORGANIZATION_CODE,
    json: true,
    limit: 1,
  });

  return {
    rows,
    more
  };
}