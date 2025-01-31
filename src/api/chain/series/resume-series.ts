import { execute } from '@/api/chain/execute-action'
import { ResumeSeriesProps } from '@/api/model/series'

export async function resumeSeries({
  session,
  agg_symbol,
  seq_id,
}: ResumeSeriesProps) {
  await execute(session, [
    {
      account: 'bamanageryyy',
      name: 'resumeall',
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
