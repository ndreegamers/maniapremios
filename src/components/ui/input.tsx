import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-[#2A2A33] bg-[#15151A] px-3 py-2 text-sm text-[#F5F5F0] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#A0A0A8]/50 focus-visible:outline-none focus-visible:border-[#C9A961] focus-visible:ring-1 focus-visible:ring-[#C9A961]/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      {...props}
    />
  );
}

export { Input };
