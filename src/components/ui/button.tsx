import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#C9A961] text-[#0B0B0D] shadow hover:bg-[#E8D08B] active:scale-[0.98]",
        destructive:
          "bg-[#7C2D2D] text-[#F5F5F0] shadow-sm hover:bg-[#7C2D2D]/80",
        outline:
          "border border-[#3D3D48] bg-transparent text-[#F5F5F0] shadow-sm hover:border-[#C9A961]/50 hover:text-[#C9A961]",
        secondary:
          "bg-[#15151A] text-[#F5F5F0] shadow-sm hover:bg-[#24242C]",
        ghost:
          "text-[#A0A0A8] hover:text-[#F5F5F0] hover:bg-[#15151A]",
        link:
          "text-[#C9A961] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
