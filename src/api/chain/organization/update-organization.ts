import { execute } from '@/api/chain/execute-action'
import { type UpdateOrganizationProps } from '@/api/model/organization'

export async function updateOrganization({
  session,
  org,
  ipfs_image,
  display_name,
}: UpdateOrganizationProps) {
  const actions = []

  if (display_name) {
    actions.push({
      account: 'organizayyyy',
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
      account: 'organizayyyy',
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
