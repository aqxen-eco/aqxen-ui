import { AnyAction, Session } from '@wharfkit/session';

export async function execute(session: Session, actions: AnyAction[]) {
  try {
    return await session.transact(
      { actions },
      {
        expireSeconds: 30,
      }
    );
  } catch (e) {
    const actionNames = actions.map(a => `\`${a.name}\``).join(', ');
    console.error(`[${actionNames}] Executing actions`, e);

    throw e;
  }
}
