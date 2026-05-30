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
    <div ref={ref} className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-wider",
            isHot ? "text-[#38BDF8]" : "text-[#8A90A0]"
          )}
        >
          {isHot ? "¡Casi agotado!" : "Disponibilidad"}
        </span>
        <span className="text-[10px] text-[#8A90A0]" style={{ fontFamily: "var(--font-mono-code)" }}>
          {remaining > 0 ? `${remaining} restantes` : "Agotado"}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-1 bg-[#1C1F27] rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: isHot
              ? "linear-gradient(90deg, #1D4ED8 0%, #2E6BFF 50%, #38BDF8 100%)"
              : "linear-gradient(90deg, #1D4ED8 0%, #2E6BFF 100%)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: isInView ? `${soldPercentage}%` : "0%" }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[9px] text-[#8A90A0]/60 tabular-nums" style={{ fontFamily: "var(--font-mono-code)" }}>
          {ticketsSold} vendidos
        </span>
        <span className="text-[9px] text-[#8A90A0]/60 tabular-nums" style={{ fontFamily: "var(--font-mono-code)" }}>
          {totalTickets} total
        </span>
      </div>
    </div>
  );
}
