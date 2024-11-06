import NextLink, { type LinkProps as NextLinkProps } from "next/link";

import { type ButtonVariants, button } from "@/components/ui/button";

type LinkProps = {
  className?: string;
  children: React.ReactNode;
} & NextLinkProps &
  ButtonVariants;

export function Link({
  size,
  variant,
  square,
  className,
  children,
  ...restProps
}: LinkProps) {
  return (
    <NextLink
      className={button({ size, variant, square, class: className })}
      {...restProps}
    >
      {children}
    </NextLink>
  );
}
