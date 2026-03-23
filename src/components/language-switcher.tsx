'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { MdLanguage } from 'react-icons/md'

import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { setLocale } from '@/i18n/actions'
import { type Locale, locales } from '@/i18n/config'

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(nextLocale: Locale) {
    startTransition(async () => {
      await setLocale(nextLocale)
      router.refresh()
    })
  }

  return (
    <DropdownRoot
      customTrigger={
        <button
          type="button"
          className="text-gray-3 hover:text-white focus:outline-hidden"
          disabled={isPending}
        >
          <MdLanguage className="size-5" />
        </button>
      }
      align="end"
    >
      {locales.map((l) => (
        <DropdownItem
          key={l}
          isSelected={l === locale}
          onClick={() => handleChange(l)}
        >
          {t(l)}
        </DropdownItem>
      ))}
    </DropdownRoot>
  )
}
