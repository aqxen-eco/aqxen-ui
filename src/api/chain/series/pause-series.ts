import { execute } from '@/api/chain/execute-action'
import { PauseSeriesProps } from '@/api/model/series'

export async function pauseSeries({
  session,
  agg_symbol,
  seq_id,
}: PauseSeriesProps) {
  await execute(session, [
    {
      account: 'bamanageryyy',
      name: 'pauseall',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        actor: session.actor.toString(),

        agg_symbol,
        seq_id,
      },
    },
  ])
}
