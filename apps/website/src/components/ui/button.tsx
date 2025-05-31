import * as React from "react";
import {Slot} from "@radix-ui/react-slot";
import {cva, type VariantProps} from "class-variance-authority";

import {cn} from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
        outline:
          "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2",
        ghost:
          "text-neutral-900 hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2",
        link: "text-neutral-900 underline-offset-4 hover:underline focus:outline-none"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({variant, size, className}))}
      {...props}
    />
  );
}

export {Button, buttonVariants};
