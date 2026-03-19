import { Fallback, Image, Root } from '@radix-ui/react-avatar'
import { tv, type VariantProps } from 'tailwind-variants'

import { IPFS_IMAGE_SOURCE } from '@/constants'

const badgeImage = tv({
  slots: {
    root: 'flex items-center justify-center',
    image: 'block rounded-full object-cover',
  },
  variants: {
    size: {
      lg: {
        root: 'size-32',
        image: 'size-30',
      },
      xs: {
        root: 'size-6',
        image: 'size-5.5',
      },
    },
  },
  defaultVariants: {
    size: 'lg',
  },
})

type BadgeImageVariants = VariantProps<typeof badgeImage>

type BadgeImageProps = React.ComponentProps<'img'> &
  BadgeImageVariants & {
    badgeSymbol?: string
    displayName?: string
  }

const BEAM_SUFFIX_FALLBACKS: Record<string, string> = {
  CHA: '/img/badges/badge_1.png',
  TRA: '/img/badges/badge_4.png',
  REL: '/img/badges/badge_2.png',
  PAR: '/img/badges/badge_0.png',
  RES: '/img/badges/badge_3.png',
}

// Tracking badge suffixes use the first 2 letters of the beam suffix
// prefixed with G/R/U (e.g., CHA → GCH, RCH, UCH). Where two beams
// share the same 2-letter prefix (REL/RES → RE), we cannot reliably
// distinguish them from the symbol alone, so tracking badges only map
// for unambiguous prefixes.
const TRACKING_SUFFIX_FALLBACKS: Record<string, string> = {
  CH: '/img/badges/badge_1.png', // CHA
  TR: '/img/badges/badge_4.png', // TRA
  PA: '/img/badges/badge_0.png', // PAR
}

// Maps beam display names to their fallback images for disambiguating
// tracking badges whose symbol suffixes collide (e.g., REL/RES → RE).
const BEAM_NAME_FALLBACKS: Record<string, string> = {
  Reliability: '/img/badges/badge_2.png',
  Responsibility: '/img/badges/badge_3.png',
}

function getFallbackImage(badgeSymbol?: string, displayName?: string) {
  if (!badgeSymbol) return '/img/badges/badge_0.png'

  const code = badgeSymbol.split(',')[1]
  if (!code) return '/img/badges/badge_0.png'

  const suffix = code.slice(-3).toUpperCase()
  // Direct beam match (e.g., ends with CHA, TRA, etc.)
  if (BEAM_SUFFIX_FALLBACKS[suffix]) return BEAM_SUFFIX_FALLBACKS[suffix]

  // Tracking badge match (e.g., GCH, RCH, UCH → CHA)
  if (code.length >= 3 && /^[GRU]/.test(suffix)) {
    const shortSuffix = suffix.slice(1)
    if (TRACKING_SUFFIX_FALLBACKS[shortSuffix]) {
      return TRACKING_SUFFIX_FALLBACKS[shortSuffix]
    }

    // For ambiguous suffixes (RE → REL/RES), use display name
    if (displayName) {
      for (const [beamName, img] of Object.entries(BEAM_NAME_FALLBACKS)) {
        if (displayName.startsWith(beamName)) return img
      }
    }
  }

  return '/img/badges/badge_0.png'
}

export function BadgeImage({
  size,
  src,
  className,
  badgeSymbol,
  displayName,
}: BadgeImageProps) {
  const { root, image } = badgeImage({ size })

  const srcStr = typeof src === 'string' ? src : undefined
  const isFullUrl =
    srcStr?.startsWith('blob:') ||
    srcStr?.startsWith('http://') ||
    srcStr?.startsWith('https://')
  const imageSrc = srcStr
    ? isFullUrl
      ? srcStr
      : IPFS_IMAGE_SOURCE + srcStr
    : undefined

  const fallbackSrc = getFallbackImage(badgeSymbol, displayName)

  return (
    <Root className={root({ class: className })}>
      <Image className={image()} src={imageSrc} alt="" />
      <Fallback asChild>
        <img src={fallbackSrc} className={image()} alt="" />
      </Fallback>
    </Root>
  )
}
