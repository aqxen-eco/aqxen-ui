import { execute } from '@/api/chain/execute-action'
import { EnableBadgeAutomationProps } from '@/api/model/badge-automation'

export async function enableBadgeAutomation({
  session,
  emission_symbol,
}: EnableBadgeAutomationProps) {
  await execute(session, [
    {
      account: 'aemanageryyy',
      name: 'activate',
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
