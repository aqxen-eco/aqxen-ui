import { execute } from '@/api/chain/execute-action'
import { DisableBadgeAutomationProps } from '@/api/model/badge-automation'

export async function disableBadgeAutomation({
  session,
  emission_symbol,
}: DisableBadgeAutomationProps) {
  await execute(session, [
    {
      account: 'aemanageryyy',
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
