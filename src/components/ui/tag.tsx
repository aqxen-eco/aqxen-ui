import { forwardRef } from "react";

import { type VariantProps, tv } from "tailwind-variants";

const tag = tv({
  base: "inline-block px-2 py-1 rounded-full font-sans font-medium uppercase text-xs text-black",
  variants: {
    variant: {
      red: "bg-badge-red",
      yellow: "bg-badge-yellow",
      green: "bg-badge-green",
      blue: "bg-badge-blue",
      purple: "bg-badge-purple",
      default: "bg-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type TagComponentProps = VariantProps<typeof tag> & React.ComponentProps<'span'>

function TagComponent(
  { variant, className, children, ...props }: TagComponentProps, 
  forwardedRef: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <span 
      ref={forwardedRef} 
      className={tag({ variant, class: className })} 
      {...props}
    >
      {children}
    </span>
  )
}

export const Tag = forwardRef(TagComponent)