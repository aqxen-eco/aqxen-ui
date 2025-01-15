import { useQuery } from '@tanstack/react-query'
import { MdClose } from 'react-icons/md'

import { listBadge } from '@/api/chain/badge'
import { BadgeImage } from '@/components/ui/badge-image'
import { Combobox, ComboboxEmpty, ComboboxItem } from '@/components/ui/combobox'
import { useOrganization } from '@/contexts/organization'

import { Button } from './button'

type InputBadgesProps = {
  label?: string
  value?: string[]
  onChange: (value: string[]) => void
  error?: string
}

export function InputBadges({
  label = 'Badges',
  value = [],
  onChange,
  error,
}: InputBadgesProps) {
  const { name, symbol } = useOrganization()

  const badgesQuery = useQuery({
    queryKey: ['badges', name, symbol],
    queryFn: async () =>
      await listBadge({
        scope: name,
        organization_symbol: symbol,
      }),
  })

  return (
    <div className="group/input space-y-2" data-error={!!error}>
      <label
        id="search"
        className="block cursor-pointer text-body-2 font-medium text-white group-data-[error=true]/input:text-red-600"
      >
        {label}
      </label>

      {badgesQuery.isSuccess && (
        <>
          {value.length > 0 && (
            <ul className="flex flex-wrap items-start justify-start gap-2">
              {value.map((id) => {
                const badge = badgesQuery?.data?.rows.find((b) => b.id === id)

                if (!badge) {
                  return null
                }

                return (
                  <li key={badge.id}>
                    <div className="inline-flex h-10 items-center rounded-full border border-gray-2 bg-gray-1 pl-2">
                      <BadgeImage src={badge.ipfs} size="xs" />
                      <span className="ml-1 text-nowrap font-sans text-body-2 font-medium text-white">
                        {badge.name}
                      </span>
                      <Button
                        size="md"
                        variant="link"
                        square
                        onClick={() => {
                          const newValue = value.filter((i) => i !== id)
                          onChange(newValue)
                        }}
                      >
                        <MdClose className="size-6" />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <Combobox
            title="Search badges"
            filter={(value, search) => {
              const badge = badgesQuery?.data?.rows.find((b) => b.id === value)
              if (badge?.name && badge.name.includes(search)) return 1
              return 0
            }}
          >
            <ComboboxEmpty />

            {badgesQuery?.data?.rows.map((badge) => (
              <ComboboxItem
                key={badge.id}
                className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-gray-3 data-[selected=true]:text-white data-[disabled=true]:opacity-50"
                value={badge.id}
                onSelect={(currentValue) => {
                  const newValue = value.includes(currentValue)
                    ? value.filter((i) => i !== currentValue)
                    : [...value, currentValue]
                  onChange(newValue)
                }}
                checked={value.includes(badge.id)}
              >
                <div className="inline-flex items-center gap-2">
                  <BadgeImage src={badge.ipfs} size="xs" />
                  <span className="text-nowrap font-sans text-body-2 font-medium capitalize text-white">
                    {badge.name}
                  </span>
                </div>
              </ComboboxItem>
            ))}
          </Combobox>

          {error && (
            <p className="mt-2 text-body-3 group-data-[error=true]/input:text-red-600">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  )
}
