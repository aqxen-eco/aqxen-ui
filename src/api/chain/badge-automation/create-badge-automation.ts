import { execute } from '@/api/chain/execute-action'
import { CreateBadgeAutomationProps } from '@/api/model/badge-automation'
import { Contract } from '@/constants'

export async function createBadgeAutomation({
  session,
  emission_symbol,
  display_name,
  ipfs_description,
  emitter_criteria,
  emit_badges,
  cyclic,
}: CreateBadgeAutomationProps) {
  await execute(session, [
    {
      account: Contract.ANDEMITTER_MANAGER,
      name: 'newemission',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        actor: session.actor.toString(),

        emission_symbol,
        display_name,
        ipfs_description,
        emitter_criteria,
        emit_badges,
        cyclic,
      },
    },
  ])
}
