import { jungleClient } from '@/api/chain/jungle-client'
import { ListMembersResult } from '@/api/model/organization'
import { Contract } from '@/constants'

type ListMembersProps = {
  scope: string
}

export async function listMembers({
  scope,
}: ListMembersProps): Promise<ListMembersResult> {
  const { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.ORGANIZATION,
    scope,
    table: 'members',
    json: true,
    limit: 1000,
  })

  return { rows, more }
}
