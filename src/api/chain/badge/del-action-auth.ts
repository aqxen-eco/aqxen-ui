import { execute } from '@/api/chain/execute-action'
import { type Session } from '@/api/model'
import { Contract } from '@/constants'

type DelActionAuthProps = {
  session: Session
  org: string
  action: string
  authorizedAccount: string
}

export async function delActionAuth({
  session,
  org,
  action,
  authorizedAccount,
}: DelActionAuthProps) {
  await execute(session, [
    {
      account: Contract.SIMPLE_MANAGER,
      name: 'delactionauth',
      authorization: [session.permissionLevel],
      data: {
        org,
        action,
        authorized_account: authorizedAccount,
      },
    },
  ])
}
