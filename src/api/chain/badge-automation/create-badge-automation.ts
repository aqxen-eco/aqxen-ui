import { execute } from '@/api/chain/execute-action'
import { CreateBadgeAutomationProps } from '@/api/model/badge-automation'

export async function createBadgeAutomation({
  session,
  symbol,
  ipfs,
  name,
  lifetime_aggregate,
  lifetime_stats,
  memo,
}: CreateBadgeAutomationProps) {
  await execute(session, [
    {
      account: 'simmanageryy',
      name: 'initsimple',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        badge_symbol: `0,${symbol.toUpperCase()}`,
        offchain_lookup_data: `{"img":"${ipfs}"}`,
        onchain_lookup_data: `{"name":"${name}"}`,
        lifetime_aggregate,
        lifetime_stats,
        memo,
      },
    },
  ])
}
