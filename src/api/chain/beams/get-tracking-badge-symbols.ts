import type { BadgeAutomation } from '@/api/model/badge-automation'

/**
 * Given a beam badge symbol and the org's automations, returns all
 * related tracking badge symbols (excluding the beam badge itself).
 *
 * Both `emitter_criteria.value` and `emit_assets.emit_asset` are stored
 * as "QUANTITY SYMBOL" asset strings, so the badge symbol must be
 * extracted from the second whitespace-separated token.
 */
export function getTrackingBadgeSymbols(
  beamBadgeSymbol: string,
  automations: BadgeAutomation[],
): string[] {
  const symbols = new Set<string>()

  for (const automation of automations) {
    const involvesBadge = automation.emitter_criteria.some((c) => {
      const sym = c.value?.split(' ')[1]
      return sym === beamBadgeSymbol
    })
    if (!involvesBadge) continue

    for (const criterion of automation.emitter_criteria) {
      const sym = criterion.value?.split(' ')[1]
      if (sym) symbols.add(sym)
    }
    for (const asset of automation.emit_assets) {
      const symbol = asset.emit_asset.split(' ')[1]
      if (symbol) symbols.add(symbol)
    }
  }

  symbols.delete(beamBadgeSymbol)
  return Array.from(symbols)
}
