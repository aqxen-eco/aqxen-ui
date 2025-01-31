import { execute } from '@/api/chain/execute-action'
import { StartSeriesProps } from '@/api/model/series'

export async function startSeries({
  session,
  agg_symbol,
  seq_ids,
}: StartSeriesProps) {
  await execute(session, [
    {
      account: 'bamanageryyy',
      name: 'actseq',
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
