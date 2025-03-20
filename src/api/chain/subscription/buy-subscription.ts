import { execute } from '@/api/chain/execute-action'
import { BuySubscriptionProps } from '@/api/model/subscription'
import { Contract } from '@/constants'
export async function buySubscription({
  session,
  quantity,
  memo,
}: BuySubscriptionProps) {
  await execute(session, [
    {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [session.permissionLevel],
      data: {
        from: session.actor,
        to: Contract.SUBSCRIPTION,
        quantity,
        memo,
      },
    },
  ])
}
