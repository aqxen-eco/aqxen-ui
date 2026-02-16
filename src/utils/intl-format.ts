export const listFormat = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
})

export function formatUsd(value: string) {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return value
  return `$${num.toFixed(2)}`
}
