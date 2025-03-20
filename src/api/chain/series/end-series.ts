import { execute } from '@/api/chain/execute-action'
import { EndSeriesProps } from '@/api/model/series'
import { Contract } from '@/constants'

export async function endSeries({
  session,
  agg_symbol,
  seq_ids,
}: EndSeriesProps) {
  await execute(session, [
    {
      account: Contract.BOUNDED_AGG_MANAGER,
      name: 'endseq',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        actor: session.actor.toString(),

        agg_symbol,
        seq_ids,
      },
    },
  ])
}
