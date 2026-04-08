import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { MdOutlineInterests, MdOutlineLocationOn, MdStar, MdWorkspacePremium } from 'react-icons/md'

import { ProfileForm } from '@/components/profile-form'
import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { IPFS_IMAGE_SOURCE } from '@/constants'
import { intlLocaleMap } from '@/i18n/date-locale'
import { formatNumber } from '@/utils/intl-format'

import { ClaimBeamsSection } from './claim-beams-section'
import {
  getUserBadges,
  getUserOrganizations,
  getUserPosts,
  getUserProfile,
  getUserReputation,
} from './functions'
import { LifetimeBadgesSection } from './lifetime-badges-section'
import { OrgBadgesSection } from './org-badges-section'
import { ProfileFeed } from './profile-feed'
import { ProfileTabs } from './profile-tabs'

export const dynamic = 'force-dynamic'

type ProfilePageProps = {
  params: Promise<{
    user: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { user } = await params

  const t = await getTranslations('profile')
  const locale = await getLocale()
  const intlLocale = intlLocaleMap[locale as keyof typeof intlLocaleMap] ?? 'en-US'

  const [profile, { badges, seasons, beamBadges, beamSeasons }, userOrgs, posts, reputation] = await Promise.all([
    getUserProfile({ actor: user }),
    getUserBadges({ user }),
    getUserOrganizations({ user }),
    getUserPosts({ user }),
    getUserReputation({ user }),
  ])

  if (!user) {
    return null
  }

  const feedContent = <ProfileFeed posts={posts} />

  const orgAccounts = [
    ...new Set([
      ...badges.map((b) => b.orgAccountName),
      ...seasons.map((s) => s.orgAccountName),
    ]),
  ].filter(Boolean)

  const orgGroups = orgAccounts.map((orgAccount) => {
    const orgBadge = badges.find((b) => b.orgAccountName === orgAccount)
    const orgSeason = seasons.find((s) => s.orgAccountName === orgAccount)

    return {
      orgAccount,
      displayName: orgBadge?.orgName || orgSeason?.orgDisplayName || orgAccount,
      ipfsImage: orgBadge?.orgIpfsImage || orgSeason?.orgIpfsImage || '',
      badges: badges.filter((b) => b.orgAccountName === orgAccount),
      seasons: seasons.filter((s) => s.orgAccountName === orgAccount),
    }
  })

  const badgesContent = (
    <>
      {badges.length > 0 && (
        <LifetimeBadgesSection badges={badges} showOrgOverlay />
      )}

      {orgGroups.map((group) => (
        <OrgBadgesSection
          key={group.orgAccount}
          orgAccount={group.orgAccount}
          displayName={group.displayName}
          ipfsImage={group.ipfsImage}
          badges={group.badges}
          seasons={group.seasons}
        />
      ))}

      {badges.length === 0 && seasons.length === 0 && (
        <div className="px-8 py-8 max-md:px-4">
          <p className="text-body-2 text-gray-3">{t('noBadgesYet')}</p>
        </div>
      )}
    </>
  )

  const beamOrgAccounts = [
    ...new Set([
      ...beamBadges.map((b) => b.orgAccountName),
      ...beamSeasons.map((s) => s.orgAccountName),
    ]),
  ].filter(Boolean)

  const beamOrgGroups = beamOrgAccounts.map((orgAccount) => {
    const orgBadge = beamBadges.find((b) => b.orgAccountName === orgAccount)
    const orgSeason = beamSeasons.find(
      (s) => s.orgAccountName === orgAccount,
    )

    return {
      orgAccount,
      displayName:
        orgBadge?.orgName || orgSeason?.orgDisplayName || orgAccount,
      ipfsImage: orgBadge?.orgIpfsImage || orgSeason?.orgIpfsImage || '',
      badges: beamBadges.filter((b) => b.orgAccountName === orgAccount),
      seasons: beamSeasons.filter((s) => s.orgAccountName === orgAccount),
    }
  })

  const beamsContent = (
    <>
      {beamOrgGroups.map((group) => (
        <OrgBadgesSection
          key={group.orgAccount}
          orgAccount={group.orgAccount}
          displayName={group.displayName}
          ipfsImage={group.ipfsImage}
          badges={group.badges}
          seasons={group.seasons}
          label={t('tabBeams')}
        />
      ))}

      {beamBadges.length === 0 && beamSeasons.length === 0 && (
        <div className="px-8 py-8 max-md:px-4">
          <p className="text-body-2 text-gray-3">{t('noBeamsYet')}</p>
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
            <div className="flex items-center gap-3">
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
            </div>
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
                <h3 className="text-title-2 text-white">{t('about')}</h3>
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
                  {t('organizations')}
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
                      <span className="text-body-2 flex items-center gap-1 font-medium text-white">
                        {displayName}
                        <span className="text-gray-3 flex items-center gap-0.5">
                          <MdWorkspacePremium className="size-4" />
                          {formatNumber(reputation.perOrg[org.org] ?? 0, intlLocale)}
                        </span>
                      </span>
                      {org.isOwner && (
                        <MdStar
                          className="text-badge-yellow size-4"
                          title={t('owner')}
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
              {t('noInfoAvailable')}
            </p>
          )}
        </section>

        <ClaimBeamsSection
          user={user}
          userOrgNames={userOrgs.map((org) => org.org)}
          orgDisplayNames={Object.fromEntries(
            userOrgs.map((org) => [
              org.org,
              org.onchain_lookup_data?.user?.display_name || org.org,
            ]),
          )}
        />

        <ProfileTabs feedContent={feedContent} badgesContent={badgesContent} beamsContent={beamsContent} />
      </Box>
    </div>
  )
}
