import { execute } from '@/api/chain/execute-action'
import { type UpdateOrganizationProps } from '@/api/model/organization'
import { Contract } from '@/constants'

export async function updateOrganization({
  session,
  org,
  ipfs_image,
  display_name,
}: UpdateOrganizationProps) {
  const actions = []

  if (display_name) {
    actions.push({
      account: Contract.ORGANIZATION,
      name: 'displayname',
      authorization: [session.permissionLevel],
      data: {
        org,
        display_name,
        permission: session.permission.toString(),
        actor: session.actor.toString(),
      },
    })
  }

  if (ipfs_image) {
    actions.push({
      account: Contract.ORGANIZATION,
      name: 'image',
      authorization: [session.permissionLevel],
      data: {
        org,
        ipfs_image,
        permission: session.permission.toString(),
        actor: session.actor.toString(),
      },
    })
  }

  await execute(session, actions)
}
