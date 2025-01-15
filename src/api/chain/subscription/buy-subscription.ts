import { BuySubscriptionProps } from '@/api/model/subscription'
import { execute } from '@/chain-action'
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
