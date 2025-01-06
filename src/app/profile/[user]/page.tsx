import { MdOutlineModeEdit } from "react-icons/md";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BadgeSwiper,
  BadgeSwiperSlide,
  BadgeSwiperWrapper,
} from "@/components/ui/badge-swiper";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";

import { getUserBadges } from "./functions";
import { SeasonalBadgesSection } from "./seasonal-badges-section";

type ProfilePageProps = {
  params: Promise<{
    user: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { user } = await params;

  const { badges, seasons } = await getUserBadges({
    user,
  });

  if (!user) {
    return null;
  }

  // const { orgAggregates } = await getSeasons();

  return (
    <div className="mx-auto max-w-container-md space-y-8 py-8 mobile:pt-0 desktop:px-4">
      <Box className="divide-y divide-gray-2 overflow-hidden p-0 mobile:rounded-none mobile:border-0 mobile:bg-black">
        <div className="relative h-52 w-full bg-gradient">
          {/* Later control disabled based on the logged in account vs profile link */}
          <Button
            variant="secondary"
            className="absolute right-4 top-4 z-10"
            disabled
          >
            <MdOutlineModeEdit className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-8 mobile:px-4">
          <Avatar size="lg" className="flex-none">
            {user.slice(0, 2)}
          </Avatar>
          <h1 className="text-title-2 text-white">{user}</h1>
        </div>

        {badges.length > 0 && (
          <section className="py-8">
            <header className="mb-4 px-8 mobile:px-4">
              <h3 className="text-title-2 text-white">
                Lifetime Badges{" "}
                <span className="text-gray-3">({badges.length})</span>
              </h3>
            </header>
            <BadgeSwiper>
              <BadgeSwiperWrapper>
                {badges.map((badge, index) => (
                  <BadgeSwiperSlide key={index}>
                    <Badge name={badge.name} balance="0" ipfs={badge.ipfs} />
                  </BadgeSwiperSlide>
                ))}
              </BadgeSwiperWrapper>
            </BadgeSwiper>
          </section>
        )}

        <SeasonalBadgesSection seasons={seasons} />
      </Box>
    </div>
  );
}
