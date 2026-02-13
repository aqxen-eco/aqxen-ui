import { MdOutlineInterests, MdOutlineLocationOn } from 'react-icons/md'

import { ProfileForm } from '@/components/profile-form'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  BadgeSwiper,
  BadgeSwiperSlide,
  BadgeSwiperWrapper,
} from '@/components/ui/badge-swiper'
import { Box } from '@/components/ui/box'
import { IPFS_IMAGE_SOURCE } from '@/constants'

import { getUserBadges, getUserProfile } from './functions'
import { SeasonalBadgesSection } from './seasonal-badges-section'

type ProfilePageProps = {
  params: Promise<{
    user: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { user } = await params

  const [profile, { badges, seasons }] = await Promise.all([
    getUserProfile({ actor: user }),
    getUserBadges({
      user,
    }),
  ])

  if (!user) {
    return null
  }

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

        {profile?.about && (
          <section className="py-8">
            <header className="mb-4 px-8 max-md:px-4">
              <h3 className="text-title-2 text-white">About</h3>
            </header>
            <p className="text-gray-3 text-body-2 px-8 max-md:px-4">
              {profile.about}
            </p>
          </section>
        )}

        {badges.length > 0 && (
          <section className="py-8">
            <header className="mb-4 px-8 max-md:px-4">
              <h3 className="text-title-2 text-white">
                Lifetime Badges{' '}
                <span className="text-gray-3">({badges.length})</span>
              </h3>
            </header>
            <BadgeSwiper>
              <BadgeSwiperWrapper>
                {badges.map((badge, index) => (
                  <BadgeSwiperSlide key={index}>
                    <Badge
                      name={badge.onchain_lookup_data.user.display_name}
                      balance={String(badge.balance)}
                      ipfs={badge.offchain_lookup_data.user.ipfs_image}
                    />
                  </BadgeSwiperSlide>
                ))}
              </BadgeSwiperWrapper>
            </BadgeSwiper>
          </section>
        )}

        {seasons.map((season) => (
          <SeasonalBadgesSection
            key={season.agg_symbol}
            lastSeriesId={season.active_seq_ids.at(-1)}
            name={season.onchain_lookup_data.user.display_name}
            series={season.series}
          />
        ))}
      </Box>
    </div>
  )
}
