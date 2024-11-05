import * as Avatar from "@radix-ui/react-avatar";
import Image from "next/image";

import fallbackImg from "@/assets/badges/badge_2.png";
// import { IPFS_IMAGE_SOURCE } from '@/constants'
// import { useBadges } from '@/hooks/badges'
// import { useSeasons } from '@/hooks/seasons'

type BadgeProps = {
  imageSrc?: string;
  name: string;
  balance: string;
};

export function Badge({ imageSrc, name, balance }: BadgeProps) {
  // const { orgBadges } = useBadges()
  // const { orgSeasonalBadges } = useSeasons()

  // if (seasonal) {
  //   symbol =
  //     orgSeasonalBadges
  //       ?.find((orgSeasonalBadge) => orgSeasonalBadge.badge_agg_seq_id.toString() == symbol)
  //       ?.badge_symbol?.split(',', 2)[1] ?? ''
  // }

  // const badgeImage =
  //   IPFS_IMAGE_SOURCE +
  //   orgBadges
  //     ?.find((orgBadge) => orgBadge.badge_symbol.split(',', 2)[1] == symbol)
  //     ?.offchain_lookup_data.split('"', 4)[3]

  // const badgeName = orgBadges
  //   ?.find((orgBadge) => orgBadge.badge_symbol.split(',', 2)[1] == symbol)
  //   ?.onchain_lookup_data.split('"', 4)[3]

  return (
    <div className="text-center">
      <Avatar.Root>
        {/* TODO: Update this to parse badges lookup data */}
        <Avatar.Image
          className="mx-auto block h-32 w-32 rounded-full object-cover"
          src={imageSrc}
        />
        <Avatar.Fallback className="mx-auto block h-32 w-32 rounded-full object-cover">
          <Image src={fallbackImg} alt="" />
        </Avatar.Fallback>
      </Avatar.Root>
      <p className="mt-2 text-body-2 font-medium capitalize text-white">
        {name}
      </p>
      {/* <p className="font-medium text-white">{symbol}</p> */}
      <p className="text-body-2 text-gray-3">{balance}</p>
    </div>
  );
}
