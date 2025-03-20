import { execute } from '@/api/chain/execute-action'
import { AddSeriesProps } from '@/api/model/series'
import { Contract } from '@/constants'

export async function addSeries({
  session,
  agg_symbol,
  badge_symbols,
  sequence_description,
  // start_right_away,
}: AddSeriesProps) {
  // let startRightAway = {}

  // if (start_right_away) {
  //   startRightAway = {
  //     account: 'bamanageryyy',
  //     name: 'actseq',
  //     authorization: [session.permissionLevel],
  //     data: {
  //       authorized: session.actor.toString(),
  //       permission: session.permission.toString(),
  //       actor: session.actor.toString(),

  //       agg_symbol,
  //       seq_ids: [1, 2],
  //     },
  //   }
  // }

  await execute(session, [
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
  ])
}
