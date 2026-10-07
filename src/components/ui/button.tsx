import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "relative inline-flex min-h-11 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-[var(--dur-ui)] ease-[var(--ease-out)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
  {
    variants: {
      variant: {
        primary:
          "bg-wheat text-on-wheat shadow-soft hover:bg-[color-mix(in_oklab,var(--wheat)_88%,white)] hover:shadow-lift",
        outline:
          "border border-current/40 bg-transparent text-current backdrop-blur-sm hover:border-current hover:bg-current/[0.06]",
        ghost: "bg-transparent text-current hover:bg-current/[0.07]",
        sage: "bg-sage text-cream hover:bg-[color-mix(in_oklab,var(--sage)_85%,black)]",
      },
      size: {
        sm: "h-11 px-4 text-sm",
        md: "h-12 px-6 text-[0.95rem]",
        lg: "h-14 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
