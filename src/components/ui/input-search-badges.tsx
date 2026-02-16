import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { listBadge } from '@/api/chain/badge/list-badge'
import type { Badge } from '@/api/model/badge'
import { BadgeImage } from '@/components/ui/badge-image'
import { Combobox, ComboboxEmpty, ComboboxItem } from '@/components/ui/combobox'
import { useOrganization } from '@/contexts/organization'

type InputSearchBadgesProps = {
  value?: string[]
  onChange: (value: Badge[]) => void
}

export function InputSearchBadges({
  value = [],
  onChange,
}: InputSearchBadgesProps) {
  const { name } = useOrganization()

  const badgesQuery = useQuery({
    queryKey: ['badges', name],
    queryFn: async () => await listBadge({ scope: name }),
  })

  const hasSynced = useRef(false)
  useEffect(() => {
    if (badgesQuery.isSuccess && value.length > 0 && !hasSynced.current) {
      hasSynced.current = true
      const selectedBadges = badgesQuery?.data?.rows.reduce<Badge[]>(
        (accumulator, currentValue) => {
          if (value.includes(currentValue.badge_symbol)) {
            return [...accumulator, currentValue]
          }
          return accumulator
        },
        []
      )
      onChange(selectedBadges ?? [])
    }
  }, [badgesQuery.isSuccess, badgesQuery.data, value, onChange])

  function handleOnSelect(currentValue: string) {
    const newValue = value.includes(currentValue)
      ? value.filter((i) => i !== currentValue)
      : [...value, currentValue]

    const selectedBadges = badgesQuery?.data?.rows.reduce<Badge[]>(
      (accumulator, currentValue) => {
        if (newValue.includes(currentValue.badge_symbol)) {
          return [...accumulator, currentValue]
        }
        return accumulator
      },
      []
    )
    onChange(selectedBadges ?? [])
  }

  function handleFilter(badgeId: string, search: string) {
    const badge = badgesQuery?.data?.rows.find(
      (b) => b.badge_symbol === badgeId
    )
    if (
      badge?.onchain_lookup_data &&
      badge.onchain_lookup_data.user.display_name.includes(search.toLowerCase())
    )
      return 1
    return 0
  }

  if (!badgesQuery.isSuccess) {
    return (
      <div className="border-gray-3 flex h-12 w-full items-center justify-between border-b">
        <div className="bg-gray-2 h-4 w-20 rounded-full" />
      </div>
    )
  }

  return (
    <Combobox title="Search badges" filter={handleFilter}>
      <ComboboxEmpty />

      {badgesQuery?.data?.rows.map((badge) => (
        <ComboboxItem
          key={badge.badge_symbol}
          className="data-[selected=true]:bg-gray-3 relative flex cursor-default items-center gap-2 rounded-xs px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:text-white"
          value={badge.badge_symbol}
          onSelect={handleOnSelect}
          checked={value.includes(badge.badge_symbol)}
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
  )
}
