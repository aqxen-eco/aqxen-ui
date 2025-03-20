import { execute } from '@/api/chain/execute-action'
import { CreateSeasonProps } from '@/api/model/season'
import { Contract } from '@/constants'

export async function createSeason({
  session,
  agg_symbol,
  badge_symbols,
  stats_badge_symbols,
  ipfs_image,
  display_name,
  description,
}: CreateSeasonProps) {
  await execute(session, [
    {
      account: Contract.BOUNDED_AGG_MANAGER,
      name: 'initagg',
      authorization: [session.permissionLevel],
      data: {
        actor: session.actor.toString(),
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        agg_symbol: `0,${agg_symbol.toUpperCase()}`,
        badge_symbols,
        stats_badge_symbols,
        ipfs_image,
        display_name,
        description,
      },
    },
  ])
}
