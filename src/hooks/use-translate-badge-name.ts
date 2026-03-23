'use client'

import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

const SYSTEM_BEAM_NAMES = [
  'Charity',
  'Participation',
  'Reliability',
  'Responsibility',
  'Transparency',
] as const

// Suffixes that follow a beam name — ordered longest-first so
// "Giver Rep Emission" matches before "Emission"
const KNOWN_SUFFIXES = [
  'Giver Rep Emission',
  'Beam Emission',
  'Uniqueness Emission',
  'Sender Reputation',
  'Sender Uniqueness',
  'Reputation',
  'Uniqueness',
  'Emission',
  'Giving',
  'Beam',
  'Rep',
] as const

type TranslationKey =
  | (typeof SYSTEM_BEAM_NAMES)[number]
  | (typeof KNOWN_SUFFIXES)[number]

// Build case-insensitive lookup for beam names
const BEAM_NAME_MAP = new Map(
  SYSTEM_BEAM_NAMES.map((n) => [n.toLowerCase(), n]),
)

// Build case-insensitive lookup for suffixes
const SUFFIX_MAP = new Map(
  KNOWN_SUFFIXES.map((s) => [s.toLowerCase(), s]),
)

// Description patterns — maps suffix to the translation key for descriptions
const DESC_SUFFIX_TO_KEY: Record<string, string> = {
  beam: 'descBeam',
  reputation: 'descReputation',
  'sender reputation': 'descSenderReputation',
  'sender uniqueness': 'descSenderUniqueness',
}

export function useTranslateBadgeName() {
  const t = useTranslations('badgeNames')

  return useCallback(
    (displayName: string) => {
      const trimmed = displayName.trim()
      const lower = trimmed.toLowerCase()

      // Direct beam name match (e.g., "Charity")
      const directMatch = BEAM_NAME_MAP.get(lower)
      if (directMatch) {
        return t(directMatch as TranslationKey)
      }

      // Try each beam name as a prefix, then match the suffix
      for (const [beamLower, beamKey] of BEAM_NAME_MAP) {
        if (!lower.startsWith(`${beamLower} `)) continue

        const rest = trimmed.slice(beamKey.length + 1)
        const suffixMatch = SUFFIX_MAP.get(rest.toLowerCase())

        if (suffixMatch) {
          return `${t(beamKey as TranslationKey)} ${t(suffixMatch as TranslationKey)}`
        }
      }

      // Not a system badge — return as-is (custom user input)
      return displayName
    },
    [t],
  )
}

export function useTranslateBadgeDescription() {
  const t = useTranslations('badgeNames')

  return useCallback(
    (description: string, displayName: string) => {
      const nameLower = displayName.trim().toLowerCase()

      // Find which beam type this belongs to
      for (const [beamLower, beamKey] of BEAM_NAME_MAP) {
        if (!nameLower.startsWith(beamLower)) continue

        // Extract the suffix (e.g., "Beam", "Reputation", "Sender Reputation")
        const suffix =
          nameLower === beamLower
            ? ''
            : nameLower.slice(beamLower.length + 1)

        const descKey = DESC_SUFFIX_TO_KEY[suffix]
        if (descKey) {
          return t(descKey as TranslationKey, {
            type: t(beamKey as TranslationKey).toLowerCase(),
          })
        }
      }

      // Not a system badge description — return as-is
      return description
    },
    [t],
  )
}
