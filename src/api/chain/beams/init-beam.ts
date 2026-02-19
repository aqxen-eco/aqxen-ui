import { execute } from '@/api/chain/execute-action'
import { type Session } from '@/api/model'
import { Contract } from '@/constants'

type InitBeamProps = {
  session: Session
  symbol: string
  display_name: string
  ipfs_image: string
  description: string
  starttime: string
  cycle_length: number
  supply_per_cycle: number
  lifetime_aggregate: boolean
  lifetime_stats: boolean
  memo: string
}

export async function initBeam({
  session,
  symbol,
  display_name,
  ipfs_image,
  description,
  starttime,
  cycle_length,
  supply_per_cycle,
  lifetime_aggregate,
  lifetime_stats,
  memo,
}: InitBeamProps) {
  await execute(session, [
    {
      account: Contract.BEAMS_MANAGER,
      name: 'initbeam',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        badge_symbol: `0,${symbol.toUpperCase()}`,
        display_name,
        ipfs_image,
        description,
        starttime,
        cycle_length,
        supply_per_cycle,
        lifetime_aggregate,
        lifetime_stats,
        memo,
      },
    },
  ])
}
