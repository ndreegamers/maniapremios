import { cn } from "@/lib/utils";

interface OrnamentalDividerProps {
  className?: string;
  label?: string;
}

export function OrnamentalDivider({ className, label }: OrnamentalDividerProps) {
  return (
    <div className={cn("flex items-center gap-4 py-2", className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3D3D48] to-transparent" />
      <span className="text-[#3D3D48] text-sm select-none">
        {label ?? "◆"}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3D3D48] to-transparent" />
    </div>
  );
}
