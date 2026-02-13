import { execute } from '@/api/chain/execute-action'
import { type MemberActionProps } from '@/api/model/organization'
import { Contract } from '@/constants'

export async function acceptMember({
  session,
  org,
  user,
  memo,
}: MemberActionProps) {
  await execute(session, [
    {
      account: Contract.ORGANIZATION,
      name: 'accept',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor,
        org,
        user,
        memo,
      },
    },
  ])
}
