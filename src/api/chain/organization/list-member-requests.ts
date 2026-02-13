import { jungleClient } from '@/api/chain/jungle-client'
import { ListMemberRequestsResult } from '@/api/model/organization'
import { Contract } from '@/constants'

type ListMemberRequestsProps = {
  scope: string
}

export async function listMemberRequests({
  scope,
}: ListMemberRequestsProps): Promise<ListMemberRequestsResult> {
  const { rows, more } = await jungleClient.v1.chain.get_table_rows({
    code: Contract.ORGANIZATION,
    scope,
    table: 'requests',
    json: true,
  })

  return { rows, more }
}
