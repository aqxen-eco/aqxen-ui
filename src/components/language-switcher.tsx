'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { setLocale } from '@/i18n/actions'
import { type Locale, locales } from '@/i18n/config'

const flags: Record<Locale, string> = {
  en: '\u{1F1EC}\u{1F1E7}',
  zh: '\u{1F1E8}\u{1F1F3}',
}

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher')
  const locale = useLocale() as Locale
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
          <span className="text-lg leading-none">{flags[locale]}</span>
        </button>
      }
      align="end"
    >
      {locales
        .filter((l) => l !== locale)
        .map((l) => (
          <DropdownItem key={l} onClick={() => handleChange(l)}>
            <span className="flex items-center gap-2">
              <span>{flags[l]}</span>
              {t(l)}
            </span>
          </DropdownItem>
        ))}
    </DropdownRoot>
  )
}
