import { execute } from '@/api/chain/execute-action'
import { type Session } from '@/api/model'
import { Contract } from '@/constants'

type ClaimBeamProps = {
  session: Session
  badgeSymbols: string[]
}

export async function claimBeam({ session, badgeSymbols }: ClaimBeamProps) {
  const actions = badgeSymbols.map((badge_symbol) => ({
    account: Contract.BEAMS_MANAGER,
    name: 'claimbeam',
    authorization: [session.permissionLevel],
    data: {
      claimer: session.actor.toString(),
      badge_symbol,
    },
  }))

  await execute(session, actions)
}
