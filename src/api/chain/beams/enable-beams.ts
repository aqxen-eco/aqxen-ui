import { execute } from '@/api/chain/execute-action'
import { type Session } from '@/api/model'
import { Contract } from '@/constants'

type EnableBeamsProps = {
  session: Session
  starttime: string
}

export async function enableBeams({ session, starttime }: EnableBeamsProps) {
  await execute(session, [
    {
      account: Contract.BEAMS_MANAGER,
      name: 'enablebeams',
      authorization: [session.permissionLevel],
      data: {
        org: session.actor.toString(),
        starttime,
      },
    },
  ])
}
