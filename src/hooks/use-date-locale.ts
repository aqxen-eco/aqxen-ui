'use client'

import { useLocale } from 'next-intl'

import { getDateFnsLocale, intlLocaleMap } from '@/i18n/date-locale'

export function useDateLocale() {
  const locale = useLocale()
  return getDateFnsLocale(locale)
}

export function useIntlLocale() {
  const locale = useLocale()
  return intlLocaleMap[locale as keyof typeof intlLocaleMap] ?? 'en-US'
}
