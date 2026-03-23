import { enUS, zhCN } from 'date-fns/locale'

import type { Locale } from './config'

const localeMap: Record<string, typeof enUS> = {
  en: enUS,
  zh: zhCN,
}

export const intlLocaleMap: Record<Locale, string> = {
  en: 'en-US',
  zh: 'zh-CN',
}

export function getDateFnsLocale(locale: string) {
  return localeMap[locale] ?? enUS
}
