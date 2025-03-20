import { useQuery } from '@tanstack/react-query'
import { MdClose } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

import { listBadge } from '@/api/chain/badge/list-badge'
import { BadgeImage } from '@/components/ui/badge-image'
import { Combobox, ComboboxEmpty, ComboboxItem } from '@/components/ui/combobox'
import { useOrganization } from '@/contexts/organization'

import { Button } from './button'

type InputBadgesProps = {
  value?: string[] | null
  onChange: (value: string[]) => void
  hideSearch?: boolean
  hideRemoveBadgeButton?: boolean
}

export function InputBadges({
  value = [],
  onChange,
  hideSearch = false,
  hideRemoveBadgeButton = false,
}: InputBadgesProps) {
  const { name } = useOrganization()

  const badgesQuery = useQuery({
    queryKey: ['badges', name],
    queryFn: async () =>
      await listBadge({
        scope: name,
      }),
  })

  if (!badgesQuery.isSuccess) {
    return (
      <div className="border-gray-3 flex h-12 w-full items-center justify-between border-b">
        <div className="bg-gray-2 h-4 w-20 rounded-full" />
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      {value && value.length > 0 && (
        <ul className="flex flex-wrap items-start justify-start gap-2">
          {value.map((badgeSymbolSelected) => {
            const badge = badgesQuery?.data?.rows.find(
              (b) => b.badge_symbol === badgeSymbolSelected
            )

            if (!badge) {
              return null
            }

            return (
              <li key={badge.badge_symbol}>
                <div className="border-gray-2 bg-gray-1 inline-flex h-10 items-center rounded-full border pl-2">
                  <BadgeImage
                    src={badge.offchain_lookup_data.user.ipfs_image}
                    size="xs"
                  />
                  <span
                    className={twMerge(
                      'text-body-2 ml-1 font-sans font-medium text-nowrap text-white',
                      hideRemoveBadgeButton && 'mr-4'
                    )}
                  >
                    {badge.onchain_lookup_data.user.display_name}
                  </span>
                  {!hideRemoveBadgeButton && (
                    <Button
                      size="md"
                      variant="link"
                      square
                      onClick={() => {
                        const newValue = value.filter(
                          (i) => i !== badgeSymbolSelected
                        )
                        onChange(newValue)
                      }}
                    >
                      <MdClose className="size-6" />
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!hideSearch && (
        <Combobox
          title="Search badges"
          filter={(value, search) => {
            const badge = badgesQuery?.data?.rows.find(
              (b) => b.badge_symbol === value
            )
            if (
              badge?.onchain_lookup_data.user.display_name &&
              badge.onchain_lookup_data.user.display_name.includes(search)
            )
              return 1
            return 0
          }}
        >
          <ComboboxEmpty />

          {badgesQuery?.data?.rows.map((badge) => (
            <ComboboxItem
              key={badge.badge_symbol}
              className="data-[selected=true]:bg-gray-3 relative flex cursor-default items-center gap-2 rounded-xs px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:text-white"
              value={badge.badge_symbol}
              onSelect={(currentValue) => {
                const newValue = value?.includes(currentValue)
                  ? value.filter((i) => i !== currentValue)
                  : [...(value ?? []), currentValue]
                onChange(newValue)
              }}
              checked={value?.includes(badge.badge_symbol)}
            >
              <div className="inline-flex items-center gap-2">
                <BadgeImage
                  src={badge.offchain_lookup_data.user.ipfs_image}
                  size="xs"
                />
                <span className="text-body-2 font-sans font-medium text-nowrap text-white">
                  {badge.onchain_lookup_data.user.display_name}
                </span>
              </div>
            </ComboboxItem>
          ))}
        </Combobox>
      )}
    </div>
  )
}
