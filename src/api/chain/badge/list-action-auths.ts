import { jungleClient } from '@/api/chain/jungle-client'
import { Contract, I64 } from '@/constants'

type ActionAuth = {
  action: string
  authorized_accounts: string[]
}

type ListActionAuthsProps = {
  scope: string
}

export async function listActionAuths({ scope }: ListActionAuthsProps) {
  const result = await jungleClient.v1.chain.get_table_rows({
    code: Contract.SIMPLE_MANAGER,
    scope,
    table: 'actionauths',
    key_type: I64,
    limit: 100,
    json: true,
  })

  return result as unknown as { rows: ActionAuth[]; more: boolean }
}
