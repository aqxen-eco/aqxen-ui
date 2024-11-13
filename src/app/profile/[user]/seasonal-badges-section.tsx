"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  BadgeSwiper,
  BadgeSwiperSlide,
  BadgeSwiperWrapper,
} from "@/components/ui/badge-swiper";
import { Box } from "@/components/ui/box";
import { DropdownItem, DropdownRoot } from "@/components/ui/dropdown";

import type { Seasons } from "./functions";

type SeasonalBadgesSectionProps = {
  seasons: Seasons;
};

export function SeasonalBadgesSection({ seasons }: SeasonalBadgesSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const seasonIndex = Number(searchParams.get("season")) ?? 0;

  if (seasons.length === 0 || !seasons[seasonIndex]) {
    return null;
  }

  return (
    <section className="py-8">
      <header className="flex items-center justify-between gap-4 mb-4 px-8 mobile:px-4">
        <h3 className="text-title-2 text-white">
          {seasons[seasonIndex].name}{" "}
          <span className="text-gray-3">({seasons[0].badges.length})</span>
        </h3>
        <DropdownRoot label={seasons[seasonIndex].name} align="end">
          {seasons.map((season, index) => (
            <DropdownItem
              key={index}
              isSelected={index === seasonIndex}
              onClick={() => {
                router.push(`${pathname}?season=${index}`);
              }}
            >
              {season.name}
            </DropdownItem>
          ))}
        </DropdownRoot>
      </header>
      {seasons[seasonIndex].badges.length > 0 ? (
        <BadgeSwiper>
          <BadgeSwiperWrapper>
            {seasons[seasonIndex].badges.map((badge) => (
              <BadgeSwiperSlide key={badge.id}>
                <Badge name={badge.name} balance="0" ipfs={badge.ipfs} />
              </BadgeSwiperSlide>
            ))}
          </BadgeSwiperWrapper>
        </BadgeSwiper>
      ) : (
        <div className="px-8 mobile:px-4">
          <Box className="flex h-[12.5rem] w-full items-center justify-center text-center">
            <p className="text-body-2 text-gray-3">No Badges received yet</p>
          </Box>
        </div>
      )}
    </section>
  );
}
