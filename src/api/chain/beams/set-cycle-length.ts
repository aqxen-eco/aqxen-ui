import { execute } from '@/api/chain/execute-action'
import type { Session } from '@/api/model'
import { Contract } from '@/constants'

type SetCycleLengthProps = {
  session: Session
  badge_symbol: string
  new_cycle_length: number
}

export async function setCycleLength({
  session,
  badge_symbol,
  new_cycle_length,
}: SetCycleLengthProps) {
  await execute(session, [
    {
      account: Contract.BEAMS_MANAGER,
      name: 'setcyclelen',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        badge_symbol,
        new_cycle_length,
      },
    },
  ])
}
