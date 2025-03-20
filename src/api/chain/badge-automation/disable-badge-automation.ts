import { execute } from '@/api/chain/execute-action'
import { DisableBadgeAutomationProps } from '@/api/model/badge-automation'
import { Contract } from '@/constants'

export async function disableBadgeAutomation({
  session,
  emission_symbol,
}: DisableBadgeAutomationProps) {
  await execute(session, [
    {
      account: Contract.ANDEMITTER_MANAGER,
      name: 'deactivate',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        actor: session.actor.toString(),

        emission_symbol,
      },
    },
  ])
}
