import { cn } from "@/lib/utils";

interface SectionLabelProps {
  className?: string;
  label?: string;
}

/**
 * Section label in the style: "> LABEL"
 * Replaces the old ornamental divider (◆ style).
 */
export function OrnamentalDivider({ className, label }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center gap-4 py-2", className)}>
      <span className="section-label">{label ?? "Sorteos"}</span>
      <div className="flex-1 h-px bg-[#1C1F27]" />
    </div>
  );
}
