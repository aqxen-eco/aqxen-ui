import { execute } from '@/api/chain/execute-action'
import { type Session } from '@/api/model'
import { Contract } from '@/constants'

type AddActionAuthProps = {
  session: Session
  org: string
  action: string
  authorizedAccount: string
}

export async function addActionAuth({
  session,
  org,
  action,
  authorizedAccount,
}: AddActionAuthProps) {
  await execute(session, [
    {
      account: Contract.SIMPLE_MANAGER,
      name: 'addactionauth',
      authorization: [session.permissionLevel],
      data: {
        org,
        action,
        authorized_account: authorizedAccount,
      },
    },
  ])
}
