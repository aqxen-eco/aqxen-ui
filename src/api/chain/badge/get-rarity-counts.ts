import { listBadge } from '@/api/chain/badge/list-badge'

/**
 * Reads rarity_counts for the given badge symbols within a scope.
 * Returns a Map of "symbolName -> rarity_counts (as number)".
 * The badge_symbol format is "precision,SYMBOL" — we key by the
 * SYMBOL portion only.
 */
export async function getRarityCounts(
  scope: string,
  symbols: string[],
): Promise<Map<string, number>> {
  const result = new Map<string, number>()
  if (symbols.length === 0) return result

  const { rows } = await listBadge({ scope })

  for (const row of rows) {
    const symbolName = row.badge_symbol.split(',')[1]
    if (symbolName && symbols.includes(symbolName)) {
      result.set(symbolName, parseInt(row.rarity_counts, 10) || 0)
    }
  }

  return result
}
