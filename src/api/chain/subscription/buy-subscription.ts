import { execute } from '@/api/chain/execute-action'
import { BuySubscriptionProps } from '@/api/model/subscription'
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
        to: 'subyyyyyyyyy',
        quantity,
        memo,
      },
    },
  ])
}
