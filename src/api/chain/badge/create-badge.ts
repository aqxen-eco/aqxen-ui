import { execute } from "@/api/chain/execute-action";
import { CreateBadgeProps } from "@/api/model/badge";

export async function createBadge({
  session,
  symbol,
  ipfs,
  name,
  lifetime_aggregate,
  lifetime_stats,
  memo,
}: CreateBadgeProps) {
  await execute(session, [{
    account: "simmanageryy",
    name: "initsimple",
    authorization: [session.permissionLevel],
    data: {
      authorized: session.actor.toString(),
      permission: session.permission.toString(),
      badge_symbol: `0,ALEX${symbol.toUpperCase()}`,
      offchain_lookup_data: `{"img":"${ipfs}"}`,
      onchain_lookup_data: `{"name":"${name}"}`,
      lifetime_aggregate,
      lifetime_stats,
      memo
    },
  }])
}