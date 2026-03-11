export function getBeamWithTrackingBadges(
  beamSymbols: string[],
  allBadgeSymbols: string[]
) {
  return beamSymbols.flatMap((beamSymbol) => {
    const [precision, code] = beamSymbol.split(',')
    const suffix = code.slice(-3)
    const orgCode = code.slice(0, -3)
    const shortSuffix = suffix.slice(0, 2)

    const trackingPrefixes = ['G', 'R', 'U']
    const trackingSymbols = trackingPrefixes
      .map((p) => `${precision},${orgCode}${p}${shortSuffix}`)
      .filter((s) => allBadgeSymbols.includes(s))

    return [beamSymbol, ...trackingSymbols]
  })
}
