import Link from 'next/link'
import { MdOutlineInterests, MdOutlineLocationOn, MdStar } from 'react-icons/md'

import { ProfileForm } from '@/components/profile-form'
import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { IPFS_IMAGE_SOURCE } from '@/constants'

import {
  getUserBadges,
  getUserOrganizations,
  getUserPosts,
  getUserProfile,
} from './functions'
import { LifetimeBadgesSection } from './lifetime-badges-section'
import { ProfileFeed } from './profile-feed'
import { ProfileTabs } from './profile-tabs'
import { SeasonalBadgesSection } from './seasonal-badges-section'

type ProfilePageProps = {
  params: Promise<{
    user: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { user } = await params

  const [profile, { badges, seasons }, userOrgs, posts] = await Promise.all([
    getUserProfile({ actor: user }),
    getUserBadges({ user }),
    getUserOrganizations({ user }),
    getUserPosts({ user }),
  ])

  if (!user) {
    return null
  }

  const feedContent = <ProfileFeed posts={posts} />

  const badgesContent = (
    <>
      {badges.length > 0 && <LifetimeBadgesSection badges={badges} />}

      {seasons.map((season) => (
        <SeasonalBadgesSection
          key={season.agg_symbol}
          lastSeriesId={season.active_seq_ids.at(-1)}
          name={season.onchain_lookup_data.user.display_name}
          orgDisplayName={season.orgDisplayName}
          series={season.series}
        />
      ))}

      {badges.length === 0 && seasons.length === 0 && (
        <div className="px-8 py-8 max-md:px-4">
          <p className="text-body-2 text-gray-3">No badges yet.</p>
        </div>
      )}
    </>
  )

  return (
    <div className="max-w-container-md mx-auto space-y-8 py-8 max-md:pt-0 md:px-4">
      <Box className="divide-gray-2 divide-y overflow-hidden p-0 max-md:rounded-none max-md:border-0 max-md:bg-black">
        <div className={`relative h-52 w-full overflow-hidden ${profile?.coverIpfs ? 'bg-white' : 'bg-linear-(--gradient)'}`}>
          {profile?.coverIpfs && (
            <img
              src={IPFS_IMAGE_SOURCE + profile.coverIpfs}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <ProfileForm />
        </div>

        <div className="flex flex-wrap items-center gap-4 p-8 max-md:px-4">
          <Avatar
            size="lg"
            className={`flex-none ${profile?.avatarIpfs ? 'bg-white' : ''}`}
            src={
              profile?.avatarIpfs
                ? IPFS_IMAGE_SOURCE + profile.avatarIpfs
                : undefined
            }
          >
            {user.slice(0, 2)}
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-title-2 text-white">
              {profile?.name ? (
                <>
                  {profile.name}
                  <span className="text-body-2 text-gray-3 ml-1">({user})</span>
                </>
              ) : (
                user
              )}
            </h1>
            <div className="flex max-md:flex-col md:flex-wrap md:items-center md:gap-4">
              {profile?.location && (
                <p className="text-body-2 text-gray-3 flex items-center gap-1">
                  <MdOutlineLocationOn className="size-4" /> {profile.location}
                </p>
              )}
              {profile?.interests && (
                <p className="text-body-2 text-gray-3 flex items-center gap-1">
                  <MdOutlineInterests className="size-4" /> {profile.interests}
                </p>
              )}
            </div>
          </div>
        </div>

        <section className="py-8">
          {profile?.about && (
            <>
              <header className="mb-4 px-8 max-md:px-4">
                <h3 className="text-title-2 text-white">About</h3>
              </header>
              <p className="text-gray-3 text-body-2 px-8 max-md:px-4">
                {profile.about}
              </p>
            </>
          )}

          {userOrgs.length > 0 && (
            <div className={profile?.about ? 'mt-6' : ''}>
              <header className="mb-4 px-8 max-md:px-4">
                <h4 className="text-body-2 font-medium text-white">
                  Organizations{' '}
                  <span className="text-gray-3">({userOrgs.length})</span>
                </h4>
              </header>
              <div className="flex flex-wrap gap-4 px-8 max-md:px-4">
                {userOrgs.map((org) => {
                  const ipfsImage =
                    org.offchain_lookup_data?.user?.ipfs_image
                  const displayName =
                    org.onchain_lookup_data?.user?.display_name || org.org
                  const initials = displayName.slice(0, 2).toUpperCase()

                  return (
                    <Link
                      key={org.org}
                      href={`/organizations/${org.org}`}
                      className="border-gray-2 bg-gray-1 hover:bg-gray-2 flex items-center gap-3 rounded-full border py-2 pr-4 pl-2 duration-150"
                    >
                      <Avatar
                        size="sm"
                        color="blue"
                        src={
                          ipfsImage
                            ? `${IPFS_IMAGE_SOURCE}${ipfsImage}`
                            : undefined
                        }
                      >
                        {initials}
                      </Avatar>
                      <span className="text-body-2 font-medium text-white">
                        {displayName}
                      </span>
                      {org.isOwner && (
                        <MdStar
                          className="text-badge-yellow size-4"
                          title="Owner"
                        />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {!profile?.about && userOrgs.length === 0 && (
            <p className="text-body-2 text-gray-3 px-8 max-md:px-4">
              No info available.
            </p>
          )}
        </section>

        <ProfileTabs feedContent={feedContent} badgesContent={badgesContent} />
      </Box>
    </div>
  )
}
