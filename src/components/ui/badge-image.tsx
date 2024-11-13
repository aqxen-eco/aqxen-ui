import { Fallback, Image, Root } from "@radix-ui/react-avatar";
import { type VariantProps, tv } from "tailwind-variants";

const badgeImage = tv({
  slots: {
    root: "flex items-center justify-center ",
    image: "block object-cover rounded-full",
  },
  variants: {
    size: {
      lg: {
        root: "size-32",
        image: "size-[7.5rem]",
      },
      xs: {
        root: "size-6",
        image: "size-[1.375rem]",
      },
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

type BadgeImageVariants = VariantProps<typeof badgeImage>;

type BadgeImageProps = React.ComponentProps<"img"> & BadgeImageVariants;

export function BadgeImage({ size, src, className }: BadgeImageProps) {
  const { root, image } = badgeImage({ size });

  return (
    <Root className={root({ class: className })}>
      <Image className={image()} src={src} />
      <Fallback asChild>
        <img src="/img/badges/badge_0.png" className={image()} alt="" />
      </Fallback>
    </Root>
  );
}
