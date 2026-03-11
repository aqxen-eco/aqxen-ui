import { execute } from '@/api/chain/execute-action'
import type { Session } from '@/api/model'
import { Contract } from '@/constants'

type SetCycleSupplyProps = {
  session: Session
  badge_symbol: string
  new_supply_per_cycle: number
}

export async function setCycleSupply({
  session,
  badge_symbol,
  new_supply_per_cycle,
}: SetCycleSupplyProps) {
  await execute(session, [
    {
      account: Contract.BEAMS_MANAGER,
      name: 'setcyclesup',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        badge_symbol,
        new_supply_per_cycle,
      },
    },
  ])
}
