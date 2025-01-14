import { execute } from "@/api/chain/execute-action";
import { CreateSeasonProps } from "@/api/model/season";

export async function createSeason({
  session,
  symbol,
  description,
  badge_symbols,
  stats_badge_symbols,
}: CreateSeasonProps) {
  await execute(session, [{
    account: "bamanageryyy",
    name: "initagg",
    authorization: [session.permissionLevel],
    data: {
      actor: session.actor.toString(),
      authorized: session.actor.toString(),
      permission: session.permission.toString(),
      agg_symbol: `0,${symbol.toUpperCase()}`,
      agg_description: description,
      badge_symbols,
      stats_badge_symbols,
    },
  }])
}