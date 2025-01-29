import { execute } from '@/api/chain/execute-action'
import { SendBadgeProps } from '@/api/model/badge'

export async function sendBadge({
  session,
  symbol,
  amount,
  to,
  memo,
}: SendBadgeProps) {
  await execute(session, [
    {
      account: 'simmanageryy',
      name: 'givesimple',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        badge_symbol: symbol,
        actor: session.actor.toString(),
        amount,
        to,
        memo,
      },
    },
  ])
}
