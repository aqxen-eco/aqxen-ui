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

type BadgeImageProps = React.ComponentProps<'img'> & BadgeImageVariants

export function BadgeImage({ size, src, className }: BadgeImageProps) {
  const { root, image } = badgeImage({ size })

  const isFullUrl =
    src?.startsWith('blob:') ||
    src?.startsWith('http://') ||
    src?.startsWith('https://')
  const imageSrc = src ? (isFullUrl ? src : IPFS_IMAGE_SOURCE + src) : undefined

  return (
    <Root className={root({ class: className })}>
      <Image className={image()} src={imageSrc} alt="" />
      <Fallback asChild>
        <img src="/img/badges/badge_0.png" className={image()} alt="" />
      </Fallback>
    </Root>
  )
}
