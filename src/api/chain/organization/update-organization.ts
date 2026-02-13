import { execute } from '@/api/chain/execute-action'
import { type UpdateOrganizationProps } from '@/api/model/organization'
import { Contract } from '@/constants'

export async function updateOrganization({
  session,
  org,
  ipfs_image,
  display_name,
  short_description,
  about,
  purpose,
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

  if (short_description) {
    actions.push({
      account: Contract.ORGANIZATION,
      name: 'onckeyvalue',
      authorization: [session.permissionLevel],
      data: {
        org,
        key: 'short_description',
        value: short_description,
      },
    })
  }

  if (about) {
    actions.push({
      account: Contract.ORGANIZATION,
      name: 'onckeyvalue',
      authorization: [session.permissionLevel],
      data: {
        org,
        key: 'about',
        value: about,
      },
    })
  }

  if (purpose) {
    actions.push({
      account: Contract.ORGANIZATION,
      name: 'onckeyvalue',
      authorization: [session.permissionLevel],
      data: {
        org,
        key: 'purpose',
        value: purpose,
      },
    })
  }

  await execute(session, actions)
}
