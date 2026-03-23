'use client'

import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'

const CURRENCY_MAP: Record<string, { code: string; intlLocale: string }> = {
  en: { code: 'USD', intlLocale: 'en-US' },
  zh: { code: 'CNY', intlLocale: 'zh-CN' },
}

export function useCurrency() {
  const locale = useLocale()
  const { code: currency, intlLocale } = CURRENCY_MAP[locale] ?? CURRENCY_MAP.en

  const rateQuery = useQuery({
    queryKey: ['exchange-rate', currency],
    queryFn: async () => {
      if (currency === 'USD') return 1
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=cny',
      )
      const data = await res.json()
      return (data.usd?.cny as number) ?? 1
    },
    staleTime: 5 * 60 * 1000,
  })

  const rate = rateQuery.data ?? 1

  function formatPrice(usdAmount: number) {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
    }).format(usdAmount * rate)
  }

  function formatPriceFromString(usdValue: string) {
    const num = parseFloat(usdValue.replace(/[^0-9.]/g, ''))
    if (isNaN(num)) return usdValue
    return formatPrice(num)
  }

  function convertUsd(usdAmount: number) {
    return usdAmount * rate
  }

  return {
    currency,
    intlLocale,
    rate,
    isLoading: rateQuery.isLoading,
    formatPrice,
    formatPriceFromString,
    convertUsd,
  }
}
