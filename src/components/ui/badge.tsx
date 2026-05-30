import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border border-[#C9A961]/30 bg-[#C9A961]/10 text-[#C9A961]",
        secondary: "border border-[#2A2A33] bg-[#15151A] text-[#A0A0A8]",
        destructive: "border border-[#7C2D2D]/30 bg-[#7C2D2D]/10 text-[#EF4444]",
        outline: "border border-[#3D3D48] text-[#F5F5F0]",
        success: "border border-[#0F7B5C]/30 bg-[#0F7B5C]/10 text-[#22C55E]",
        warning: "border border-[#B8860B]/30 bg-[#B8860B]/10 text-[#B8860B]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
