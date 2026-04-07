import { useQuery } from '@tanstack/react-query'
import { MdClose } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

import { listOrganization } from '@/api/chain/organization/list-organization'
import { Combobox, ComboboxEmpty, ComboboxItem } from '@/components/ui/combobox'
import { useChain } from '@/contexts/chain'

import { Button } from './button'

type InputOrganizationProps = {
  value?: string[] | null
  onChange: (value: string[]) => void
}

export function InputOrganization({
  value = [],
  onChange,
}: InputOrganizationProps) {
  const { actor } = useChain()

  const { isSuccess, data } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => await listOrganization({}),
  })

  if (!isSuccess) {
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
          {value.map((orgSelected) => {
            return (
              <li key={orgSelected}>
                <div className="border-gray-2 bg-gray-1 inline-flex h-10 items-center rounded-full border pl-2">
                  <span
                    className={twMerge(
                      'text-body-2 ml-1 font-sans font-medium text-nowrap text-white'
                    )}
                  >
                    {orgSelected}
                  </span>
                  <Button
                    size="md"
                    variant="link"
                    square
                    onClick={() => {
                      const newValue = value.filter((i) => i !== orgSelected)
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

      <Combobox title="Search a member">
        <ComboboxEmpty />

        {data?.rows.map(
          (item) =>
            item.org !== actor && (
              <ComboboxItem
                key={item.org}
                className="data-[selected=true]:bg-gray-3 relative flex cursor-default items-center gap-2 rounded-xs px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:text-white"
                value={item.org}
                onSelect={(currentValue) => {
                  const newValue = value?.includes(currentValue)
                    ? value.filter((i) => i !== currentValue)
                    : [...(value ?? []), currentValue]
                  onChange(newValue)
                }}
                checked={value?.includes(item.org)}
              >
                <div className="inline-flex items-center gap-2">
                  <span className="text-body-2 font-sans font-medium text-nowrap text-white">
                    {item.org}
                  </span>
                </div>
              </ComboboxItem>
            )
        )}
      </Combobox>
    </div>
  )
}
