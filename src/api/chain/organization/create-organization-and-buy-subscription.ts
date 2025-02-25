import { execute } from '@/api/chain/execute-action'
import { type CreateOrganizationAndBuySubscriptionProps } from '@/api/model/organization'

export async function createOrganizationAndBuySubscription({
  session,
  quantity,
  subPackage,
}: CreateOrganizationAndBuySubscriptionProps) {
  const organizationName = session.actor.toString()
  const organizationCode = organizationName.slice(0, 4)

  await execute(session, [
    {
      account: 'organizayyyy',
      name: 'initorg',
      authorization: [session.permissionLevel],
      data: {
        org: organizationName,
        org_code: organizationCode,
        ipfs_image: '',
        display_name: '',
        permission: session.permission.toString(),
        actor: organizationName,
      },
    },
    {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [session.permissionLevel],
      data: {
        from: session.actor,
        to: 'subyyyyyyyyy',
        quantity,
        memo: `${organizationName}:${subPackage}`,
      },
    },
  ])
}
