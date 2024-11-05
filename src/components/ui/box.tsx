import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type BoxProps = {
  asChild?: boolean;
} & React.ComponentProps<"div">;

function BoxComponent(
  { asChild, className, children, ...restProps }: BoxProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={forwardedRef}
      className={twMerge(
        "rounded-2xl border border-gray-2 bg-gray-1 p-8",
        className,
      )}
      {...restProps}
    >
      {children}
    </Comp>
  );
}

export const Box = forwardRef(BoxComponent);
