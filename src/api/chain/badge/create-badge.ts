import { execute } from '@/api/chain/execute-action'
import { CreateBadgeProps } from '@/api/model/badge'
import { Contract } from '@/constants'

export async function createBadge({
  session,
  symbol,
  display_name,
  ipfs_image,
  description,
  lifetime_aggregate,
  lifetime_stats,
  memo,
}: CreateBadgeProps) {
  await execute(session, [
    {
      account: Contract.SIMPLE_MANAGER,
      name: 'initsimple',
      authorization: [session.permissionLevel],
      data: {
        authorized: session.actor.toString(),
        permission: session.permission.toString(),
        badge_symbol: `0,${symbol.toUpperCase()}`,
        display_name,
        ipfs_image,
        description,
        lifetime_aggregate,
        lifetime_stats,
        memo,
      },
    },
  ])
}
