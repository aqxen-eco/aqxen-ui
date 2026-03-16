import { execute } from '@/api/chain/execute-action'
import { type CreateOrganizationProps } from '@/api/model/organization'
import { COINGECKO_ID, Contract, TOKEN_CONTRACT, TOKEN_SYMBOL } from '@/constants'

function formatTimePointSec(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '')
}

function getStartOfDayInTimezone(timezone: string): Date {
  const now = new Date()
  const localDateStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  const [year, month, day] = localDateStr.split('-').map(Number)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  })
  const parts = formatter.formatToParts(now)
  const offsetPart = parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
  const match = offsetPart.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/)
  let offsetMinutes = 0
  if (match) {
    const hours = parseInt(match[1], 10)
    const mins = parseInt(match[2] || '0', 10)
    offsetMinutes = hours * 60 + (hours < 0 ? -mins : mins)
  }
  const utcMidnight = Date.UTC(year, month - 1, day) - offsetMinutes * 60_000
  return new Date(utcMidnight)
}

export async function createOrganization({
  session,
  org_creation_fee,
  member_fee,
  currentCycleId,
  memberCount,
  timezone,
}: CreateOrganizationProps) {
  const organizationName = session.actor.toString()
  const organizationCode = organizationName.slice(0, 4)

  const priceRes = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_ID}&vs_currencies=usd`
  )
  const data = await priceRes.json()
  const tokenPrice = data[COINGECKO_ID].usd

  const orgCreationFee = `${(
    Number(org_creation_fee.replace('USD', '').trim()) / tokenPrice
  ).toFixed(4)} ${TOKEN_SYMBOL}`

  const totalMemberUsd = Number(member_fee.replace('USD', '').trim()) * memberCount
  const memberFee = `${(totalMemberUsd / tokenPrice).toFixed(4)} ${TOKEN_SYMBOL}`

  await execute(session, [
    {
      account: TOKEN_CONTRACT,
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
    {
      account: Contract.BEAMS_MANAGER,
      name: 'enablebeams',
      authorization: [session.permissionLevel],
      data: {
        org: organizationName,
        starttime: formatTimePointSec(getStartOfDayInTimezone(timezone)),
      },
    },
  ])
}
