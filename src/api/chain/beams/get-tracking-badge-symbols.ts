import type { BadgeAutomation } from '@/api/model/badge-automation'

/**
 * Given a beam badge symbol and the org's automations, returns all
 * related tracking badge symbols (excluding the beam badge itself).
 */
export function getTrackingBadgeSymbols(
  beamBadgeSymbol: string,
  automations: BadgeAutomation[],
): string[] {
  const symbols = new Set<string>()

  for (const automation of automations) {
    const involvesBadge = automation.emitter_criteria.some(
      (c) => c.key === beamBadgeSymbol || c.value === beamBadgeSymbol,
    )
    if (!involvesBadge) continue

    for (const criterion of automation.emitter_criteria) {
      symbols.add(criterion.key)
    }
    for (const asset of automation.emit_assets) {
      const symbol = asset.emit_asset.split(' ')[1]
      if (symbol) symbols.add(symbol)
    }
  }

  symbols.delete(beamBadgeSymbol)
  return Array.from(symbols)
}
