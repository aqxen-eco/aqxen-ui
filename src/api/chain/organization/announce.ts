import { Session } from '@wharfkit/session'

import { execute } from '@/api/chain/execute-action'
import { Contract } from '@/constants'

type AnnounceProps = {
  session: Session
  org: string
  content: string
}

export async function announce({ session, org, content }: AnnounceProps) {
  return await execute(session, [
    {
      account: Contract.ORGANIZATION,
      name: 'announce',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor,
        org,
        content,
        parsed_content: content,
      },
    },
  ])
}
