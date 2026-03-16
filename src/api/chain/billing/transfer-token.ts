import { execute } from '@/api/chain/execute-action'
import { TransferTokenProps } from '@/api/model/billing'
import { COINGECKO_ID, Contract, TOKEN_CONTRACT, TOKEN_SYMBOL } from '@/constants'

export async function transferToken({
  session,
  quantity,
  currentCycleId,
  memberCount,
}: TransferTokenProps) {
  const organizationName = session.actor.toString()

  const priceRes = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_ID}&vs_currencies=usd`
  )
  const data = await priceRes.json()
  const tokenPrice = data[COINGECKO_ID].usd

  const totalUsd = Number(quantity.replace('USD', '').trim()) * memberCount
  const memberFee = `${(totalUsd / tokenPrice).toFixed(4)} ${TOKEN_SYMBOL}`

  await execute(session, [
    {
      account: TOKEN_CONTRACT,
      name: 'transfer',
      authorization: [session.permissionLevel],
      data: {
        from: session.actor,
        to: Contract.BILLING,
        quantity: memberFee,
        memo: `bill:${organizationName}:${currentCycleId}:${memberCount}`,
      },
    },
  ])
}
