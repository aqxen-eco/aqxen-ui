import { execute } from '@/api/chain/execute-action'
import { type CreateOrganizationProps } from '@/api/model/organization'
import { Contract } from '@/constants'

function formatTimePointSec(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '')
}

export async function createOrganization({
  session,
  org_creation_fee,
  member_fee,
  currentCycleId,
}: CreateOrganizationProps) {
  const organizationName = session.actor.toString()
  const organizationCode = organizationName.slice(0, 4)

  const eosValue = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=eos&vs_currencies=usd'
  )
  const data = await eosValue.json()
  const eosPrice = data.eos.usd

  const orgCreationFee = `${(
    Number(org_creation_fee.replace('USD', '').trim()) / eosPrice
  ).toFixed(4)} EOS`

  const memberFee = `${(
    Number(member_fee.replace('USD', '').trim()) / eosPrice
  ).toFixed(4)} EOS`

  await execute(session, [
    {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [session.permissionLevel],
      data: {
        from: session.actor,
        to: Contract.BILLING,
        quantity: orgCreationFee,
        memo: `neworg:${organizationName}`,
      },
    },
    {
      account: Contract.ORGANIZATION,
      name: 'initorg',
      authorization: [session.permissionLevel],
      data: {
        org: organizationName,
        org_code: organizationCode,
        ipfs_image: '',
        display_name: '',
      },
    },
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
    {
      account: Contract.BEAMS_MANAGER,
      name: 'enablebeams',
      authorization: [session.permissionLevel],
      data: {
        org: organizationName,
        starttime: formatTimePointSec(
          new Date(Date.now() + 5 * 60 * 1000),
        ),
      },
    },
  ])
}
