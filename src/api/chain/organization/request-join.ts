import { Session } from '@wharfkit/session'

import { execute } from '@/api/chain/execute-action'
import { Contract } from '@/constants'

type RequestJoinProps = {
  session: Session
  org: string
  memo: string
}

export async function requestJoin({ session, org, memo }: RequestJoinProps) {
  await execute(session, [
    {
      account: Contract.ORGANIZATION,
      name: 'reqjoin',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor,
        org,
        user: session.actor,
        memo,
      },
    },
  ])
}
