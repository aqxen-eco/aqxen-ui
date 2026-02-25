import { execute } from '@/api/chain/execute-action'
import { SendBadgeProps } from '@/api/model/badge'
import { Contract } from '@/constants'

export async function sendMultiBadge(data: SendBadgeProps[]) {
  const result = data.map((item) => ({
    account: Contract.SIMPLE_MANAGER,
    name: 'givesimple',
    authorization: [item.session.permissionLevel],
    data: {
      authorized: item.session.actor.toString(),
      permission: item.session.permission.toString(),
      badge_symbol: item.badge_symbol,
      actor: item.session.actor.toString(),
      amount: item.amount,
      to: item.to,
      memo: item.memo,
    },
  }))

  return await execute(data[0].session, result)
}
