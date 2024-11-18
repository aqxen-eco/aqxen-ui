import {
  Combobox,
  ComboboxEmpty,
  ComboboxItem,
} from "@/components/ui/combobox";
import { useEffect, useState } from "react";

import { BadgeImage } from "@/components/ui/badge-image";
import { MdClose } from "react-icons/md";
import { Button } from "./button";

type InputBadgesProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
};

export function InputBadges({ value = [], onChange, error }: InputBadgesProps) {
  const [badges, setBadges] = useState<string[]>(value);

  useEffect(() => {
    if (onChange) {
      onChange(badges);
    }
  }, [badges, onChange]);

  return (
    <div className="group/input space-y-2" data-error={!!error}>
      <label
        id="search"
        className="text-body-2 font-medium text-white block cursor-pointer group-data-[error=true]/input:text-red-600"
      >
        Badges
      </label>

      {badges.length > 0 && (
        <ul className="flex flex-wrap gap-2 items-start justify-start">
          {badges.map((item) => (
            <li key={item}>
              <div className="inline-flex items-center border border-gray-2 bg-gray-1 pl-2 rounded-full h-10">
                <BadgeImage src="/img/badges/badge_0.png" size="xs" />
                <span className="text-body-2 font-sans font-medium text-white ml-1 text-nowrap">
                  {item}
                </span>
                <Button
                  size="md"
                  variant="link"
                  square
                  onClick={() =>
                    setBadges((state) => state.filter((i) => i !== item))
                  }
                >
                  <MdClose className="size-6" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Combobox title="Search badges">
        <ComboboxEmpty />

        {[
          "Transparency",
          "Responsibility",
          "Participation",
          "Charity",
          "Reliability",
          "Apple",
          "Orange",
          "Pear",
          "Blueberry",
          "Banana",
        ].map((fruit) => (
          <ComboboxItem
            key={fruit}
            className="relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-gray-3 data-[selected=true]:text-white data-[disabled=true]:opacity-50"
            value={fruit}
            onSelect={(currentValue) => {
              setBadges((state) =>
                state.includes(currentValue)
                  ? state.filter((i) => i !== currentValue)
                  : [...state, currentValue],
              );
            }}
            checked={badges.includes(fruit)}
          >
            {fruit}
          </ComboboxItem>
        ))}
      </Combobox>

      {error && (
        <p className="mt-2 text-body-3 group-data-[error=true]/input:text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
