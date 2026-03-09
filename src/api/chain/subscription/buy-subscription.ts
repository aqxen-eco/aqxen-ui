import { execute } from '@/api/chain/execute-action'
import { BuySubscriptionProps } from '@/api/model/subscription'
import { COINGECKO_ID, Contract, TOKEN_CONTRACT, TOKEN_SYMBOL } from '@/constants'

export async function buySubscription({
  session,
  quantity,
  currentCycleId,
}: BuySubscriptionProps) {
  const organizationName = session.actor.toString()

  const priceRes = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_ID}&vs_currencies=usd`
  )
  const data = await priceRes.json()
  const tokenPrice = data[COINGECKO_ID].usd

  const memberFee = `${(Number(quantity.replace('USD', '').trim()) / tokenPrice).toFixed(4)} ${TOKEN_SYMBOL}`

  await execute(session, [
    {
      account: TOKEN_CONTRACT,
      name: 'transfer',
      authorization: [session.permissionLevel],
      data: {
        from: session.actor,
        to: Contract.BILLING,
        quantity: memberFee,
        memo: `bill:${organizationName}:${currentCycleId}:1`,
      },
    },
  ])
}
