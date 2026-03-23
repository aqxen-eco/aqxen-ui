export const listFormat = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
})

export function getListFormat(intlLocale = 'en') {
  return new Intl.ListFormat(intlLocale, {
    style: 'long',
    type: 'conjunction',
  })
}

export function formatUsd(value: string, intlLocale = 'en-US') {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return value
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

export function formatCurrency(
  amount: number,
  currency: string,
  intlLocale: string,
) {
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(value: number, intlLocale = 'en-US') {
  return new Intl.NumberFormat(intlLocale).format(value)
}

export function formatDecimal(
  value: number,
  decimals: number,
  intlLocale = 'en-US',
) {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
