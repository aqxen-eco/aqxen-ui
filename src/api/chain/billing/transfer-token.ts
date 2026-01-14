import { execute } from '@/api/chain/execute-action'
import { TransferTokenProps } from '@/api/model/billing'
import { Contract } from '@/constants'

export async function transferToken({
  session,
  quantity,
  currentCycleId,
}: TransferTokenProps) {
  const organizationName = session.actor.toString()

  const eosValue = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=eos&vs_currencies=usd'
  )
  const data = await eosValue.json()
  const eosPrice = data.eos.usd

  const memberFee = `${(Number(quantity.replace('USD', '').trim()) / eosPrice).toFixed(4)} EOS`

  await execute(session, [
    {
      account: 'eosio.token',
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
