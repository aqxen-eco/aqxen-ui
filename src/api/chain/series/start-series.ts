import { execute } from '@/api/chain/execute-action'
import { StartSeriesProps } from '@/api/model/series'
import { Contract } from '@/constants'

export async function startSeries({
  session,
  agg_symbol,
  seq_ids,
}: StartSeriesProps) {
  await execute(session, [
    {
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
    },
  ])
}
