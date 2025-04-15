import { AnyAction } from '@wharfkit/session'

import { execute } from '@/api/chain/execute-action'
import { AddSeriesProps } from '@/api/model/series'
import { Contract } from '@/constants'

export async function addSeries({
  session,
  agg_symbol,
  badge_symbols,
  sequence_description,
  start_right_away,
  seq_ids,
}: AddSeriesProps) {
  const actions: AnyAction[] = [
    {
      account: Contract.BOUNDED_AGG_MANAGER,
      name: 'initseq',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        actor: session.actor.toString(),

        agg_symbol,
        badge_symbols,
        sequence_description,
      },
    },
  ]

  if (start_right_away) {
    actions.push({
      account: Contract.BOUNDED_AGG_MANAGER,
      name: 'actseq',
      authorization: [session.permissionLevel],
      data: {
        actor: session.actor.toString(),
        authorized: session.actor.toString(),
        permission: session.permission.toString(),

        agg_symbol,
        seq_ids,
      },
    })
  }

  await execute(session, actions)
}
