import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'

import { defaultLocale, type Locale, locales } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const saved = cookieStore.get('locale')?.value
  const locale: Locale =
    saved && locales.includes(saved as Locale)
      ? (saved as Locale)
      : defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
