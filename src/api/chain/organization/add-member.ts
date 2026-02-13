import { execute } from '@/api/chain/execute-action'
import { type MemberActionProps } from '@/api/model/organization'
import { Contract } from '@/constants'

export async function addMember({
  session,
  org,
  user,
  memo,
}: MemberActionProps) {
  await execute(session, [
    {
      account: Contract.ORGANIZATION,
      name: 'addmember',
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
