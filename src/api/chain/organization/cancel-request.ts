import { Session } from '@wharfkit/session'

import { execute } from '@/api/chain/execute-action'
import { Contract } from '@/constants'

type CancelRequestProps = {
  session: Session
  org: string
  memo?: string
}

export async function cancelRequest({
  session,
  org,
  memo = '',
}: CancelRequestProps) {
  await execute(session, [
    {
      account: Contract.ORGANIZATION,
      name: 'cancelreq',
      authorization: [session.permissionLevel],
      data: {
        org,
        user: session.actor,
        memo,
      },
    },
  ])
}
