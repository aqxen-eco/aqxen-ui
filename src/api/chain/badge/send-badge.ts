import { execute } from '@/api/chain/execute-action'
import { SendBadgeProps } from '@/api/model/badge'
import { Contract } from '@/constants'

export async function sendBadge({
  session,
  badge_symbol,
  amount,
  to,
  memo,
}: SendBadgeProps) {
  await execute(session, [
    {
      account: Contract.SIMPLE_MANAGER,
      name: 'givesimple',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        badge_symbol,
        actor: session.actor.toString(),
        amount,
        to,
        memo,
      },
    },
  ])
}
