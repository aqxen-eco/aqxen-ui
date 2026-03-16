import { execute } from '@/api/chain/execute-action'
import type { Session } from '@/api/model'
import { Contract } from '@/constants'

type GiveBeamsBatchProps = {
  session: Session
  beams: {
    badge_symbol: string
    amount: number
  }[]
  from: string
  to: string
  post_content: string
  parsed_content: string
}

export async function giveBeamsBatch({
  session,
  beams,
  from,
  to,
  post_content,
  parsed_content,
}: GiveBeamsBatchProps) {
  const actions = beams.map((beam) => ({
    account: Contract.BEAMS_MANAGER,
    name: 'givebeam',
    authorization: [session.permissionLevel],
    data: {
      badge_symbol: beam.badge_symbol,
      amount: beam.amount,
      from,
      to,
      post_content,
      parsed_content,
    },
  }))

  return await execute(session, actions)
}
