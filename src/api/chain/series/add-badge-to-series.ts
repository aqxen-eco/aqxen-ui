import { execute } from '@/api/chain/execute-action'
import { AddBadgeToSeriesProps } from '@/api/model/series'

export async function addBadgeToSeries({
  session,
  agg_symbol,
  seq_ids,
  badge_symbols,
}: AddBadgeToSeriesProps) {
  await execute(session, [
    {
      account: 'bamanageryyy',
      name: 'addbadge',
      authorization: [session.permissionLevel],
      data: {
        actor: session.actor.toString(),
        authorized: session.actor.toString(),
        permission: session.permission.toString(),

        agg_symbol,
        seq_ids,
        badge_symbols,
      },
    },
  ])
}
