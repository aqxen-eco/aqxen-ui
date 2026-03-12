import { execute } from '@/api/chain/execute-action'
import type { Session } from '@/api/model'
import { Contract } from '@/constants'

type PostBeamProps = {
  session: Session
  org: string
  from: string
  post_content: string
  parsed_content: string
}

export async function postBeam({
  session,
  org,
  from,
  post_content,
  parsed_content,
}: PostBeamProps) {
  return await execute(session, [
    {
      account: Contract.BEAMS_MANAGER,
      name: 'postbeam',
      authorization: [session.permissionLevel],
      data: {
        org,
        from,
        post_content,
        parsed_content,
      },
    },
  ])
}
