"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FOMO_HOT_THRESHOLD } from "@/lib/constants";

interface ProgressBarProps {
  soldPercentage: number;
  totalTickets: number;
  ticketsSold: number;
}

export function ProgressBar({ soldPercentage, totalTickets, ticketsSold }: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);

  const isHot = soldPercentage >= FOMO_HOT_THRESHOLD;
  const remaining = totalTickets - ticketsSold;

  useEffect(() => {
    if (isInView) {
      motionValue.set(soldPercentage);
    }
  }, [isInView, soldPercentage, motionValue]);

  return (
    <div ref={ref} className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            isHot ? "text-[#C9A961]" : "text-[#A0A0A8]"
          )}
        >
          {isHot ? "¡Casi agotado!" : "Disponibilidad"}
        </span>
        <span className="text-xs text-[#A0A0A8]">
          {remaining > 0 ? `${remaining} restantes` : "Agotado"}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-1 bg-[#2A2A33] rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: isHot
              ? "linear-gradient(90deg, #8B7440 0%, #C9A961 70%, #E8D08B 100%)"
              : "linear-gradient(90deg, #3D3D48 0%, #C9A961 100%)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: isInView ? `${soldPercentage}%` : "0%" }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#A0A0A8]/60 tabular-nums">
          {ticketsSold} vendidos
        </span>
        <span className="text-[10px] text-[#A0A0A8]/60 tabular-nums">
          {totalTickets} total
        </span>
      </div>
    </div>
  );
}
