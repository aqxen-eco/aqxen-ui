import { execute } from '@/api/chain/execute-action'
import { AddBadgeToSeasonProps } from '@/api/model/season'
import { Contract } from '@/constants'

export async function addBadgeToSeason({
  session,
  agg_symbol,
  badge_symbols,
}: AddBadgeToSeasonProps) {
  await execute(session, [
    {
      account: Contract.BOUNDED_AGG_MANAGER,
      name: 'addinitbadge',
      authorization: [session.permissionLevel],
      data: {
        actor: session.actor.toString(),
        authorized: session.actor.toString(),
        permission: session.permission.toString(),

        agg_symbol,
        badge_symbols,
      },
    },
  ])
}
