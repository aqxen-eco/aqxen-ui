import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { MdClose } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

import { listBadge } from '@/api/chain/badge/list-badge'
import { listBeamTemplates } from '@/api/chain/beams/list-beam-templates'
import { BadgeImage } from '@/components/ui/badge-image'
import { Combobox, ComboboxEmpty, ComboboxItem } from '@/components/ui/combobox'
import { useOrganization } from '@/contexts/organization'

type InputBadgesProps = {
  value?: string[] | null
  onChange: (value: string[]) => void
  hideSearch?: boolean
  hideRemoveBadgeButton?: boolean
  scope?: string
  beamsOnly?: boolean
}

export function InputBadges({
  value = [],
  onChange,
  hideSearch = false,
  hideRemoveBadgeButton = false,
  scope,
  beamsOnly = false,
}: InputBadgesProps) {
  const { name } = useOrganization()
  const badgeScope = scope ?? name

  const badgesQuery = useQuery({
    queryKey: ['badges', badgeScope],
    queryFn: async () =>
      await listBadge({
        scope: badgeScope,
      }),
    enabled: !!badgeScope,
  })

  const beamTemplatesQuery = useQuery({
    queryKey: ['beam-templates'],
    queryFn: listBeamTemplates,
  })

  const filteredRows = useMemo(() => {
    if (!badgesQuery.data?.rows) return []
    if (!beamTemplatesQuery.data) return beamsOnly ? [] : badgesQuery.data.rows

    const templateNames = new Set(
      beamTemplatesQuery.data.map((t) => t.display_name)
    )
    const trackingMetrics = ['Giving', 'Rep', 'Uniqueness']

    return badgesQuery.data.rows.filter((badge) => {
      const displayName =
        badge.onchain_lookup_data.user.display_name

      if (beamsOnly) {
        return templateNames.has(displayName)
      }

      if (templateNames.has(displayName)) return false
      return !trackingMetrics.some((metric) => {
        if (!displayName.endsWith(` ${metric}`)) return false
        const beamName = displayName.slice(0, -(metric.length + 1))
        return templateNames.has(beamName)
      })
    })
  }, [badgesQuery.data?.rows, beamTemplatesQuery.data, beamsOnly])

  if (!badgesQuery.isSuccess) {
    return (
      <div className="border-gray-3 flex h-12 w-full items-center justify-between border-b">
        <div className="bg-gray-2 h-4 w-20 rounded-full" />
      </div>
    )
  }

  const selectedBadgeChips =
    value && value.length > 0
      ? value.map((badgeSymbolSelected) => {
          const badge = badgesQuery?.data?.rows.find(
            (b) => b.badge_symbol === badgeSymbolSelected
          )
          if (!badge) return null
          return (
            <div
              key={badge.badge_symbol}
              className="border-gray-2 bg-gray-2 inline-flex h-7 items-center rounded-full border pl-2"
              onClick={(e) => e.stopPropagation()}
            >
              <BadgeImage
                src={badge.offchain_lookup_data.user.ipfs_image}
                size="xs"
              />
              <span
                className={twMerge(
                  'text-body-2 ml-1 font-sans font-medium text-nowrap text-white',
                  hideRemoveBadgeButton && 'mr-3'
                )}
              >
                {badge.onchain_lookup_data.user.display_name}
              </span>
              {!hideRemoveBadgeButton && (
                <span
                  role="button"
                  tabIndex={0}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    const newValue = value.filter(
                      (i) => i !== badgeSymbolSelected
                    )
                    onChange(newValue)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                      const newValue = value.filter(
                        (i) => i !== badgeSymbolSelected
                      )
                      onChange(newValue)
                    }
                  }}
                >
                  <MdClose className="size-4" />
                </span>
              )}
            </div>
          )
        })
      : null

  return (
    <div className="mt-2">
      {!hideSearch && (
        <Combobox
          title="Search badges"
          triggerContent={selectedBadgeChips}
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

          {filteredRows.map((badge) => (
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
