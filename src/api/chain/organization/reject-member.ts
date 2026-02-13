import { execute } from '@/api/chain/execute-action'
import { type MemberActionProps } from '@/api/model/organization'
import { Contract } from '@/constants'

export async function rejectMember({
  session,
  org,
  user,
  memo,
}: MemberActionProps) {
  await execute(session, [
    {
      account: Contract.ORGANIZATION,
      name: 'reject',
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
