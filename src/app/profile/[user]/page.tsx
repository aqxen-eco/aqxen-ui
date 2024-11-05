import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BadgeSwiper,
  BadgeSwiperSlide,
  BadgeSwiperWrapper,
} from "@/components/ui/badge-swiper";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { MdOutlineModeEdit } from "react-icons/md";

import { getSeasons } from "./_functions/seasons";

export default async function ProfilePage(props: {
  params: Promise<{ user: string }>;
}) {
  const params = await props.params;
  const { orgAggregates } = await getSeasons();

  console.log(orgAggregates);

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
            {params.user ? params.user.slice(0, 2) : "un"}
          </Avatar>
          <h1 className="text-title-2 text-white">
            {params.user ?? "unknown"}
          </h1>
        </div>

        {/* <BadgeSection /> */}

        <section className="py-8">
          <header className="mb-4 px-8 mobile:px-4">
            <h3 className="text-title-2 text-white">
              Lifetime Badges <span className="text-gray-3">({10})</span>
            </h3>
          </header>
          <BadgeSwiper>
            <BadgeSwiperWrapper>
              {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
                <BadgeSwiperSlide key={index}>
                  <Badge name="Badge name" balance="Badge balance" />
                </BadgeSwiperSlide>
              ))}
            </BadgeSwiperWrapper>
          </BadgeSwiper>
        </section>

        {/* {orgAggregates.map((agg, index) => (
          <SeasonalBadgeSection key={index} agg={agg} />
        ))} */}
      </Box>
    </div>
  );
}
