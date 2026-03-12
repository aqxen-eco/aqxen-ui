import { execute } from '@/api/chain/execute-action'
import type { Session } from '@/api/model'
import { Contract } from '@/constants'

type GiveBeamProps = {
  session: Session
  badge_symbol: string
  amount: number
  from: string
  to: string
  post_content: string
  parsed_content: string
}

export async function giveBeam({
  session,
  badge_symbol,
  amount,
  from,
  to,
  post_content,
  parsed_content,
}: GiveBeamProps) {
  return await execute(session, [
    {
      account: Contract.BEAMS_MANAGER,
      name: 'givebeam',
      authorization: [session.permissionLevel],
      data: {
        badge_symbol,
        amount,
        from,
        to,
        post_content,
        parsed_content,
      },
    },
  ])
}
