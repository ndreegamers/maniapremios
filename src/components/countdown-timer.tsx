"use client";

import { useEffect, useState } from "react";
import { getTimeRemaining } from "@/lib/utils";

interface TimeUnit {
  value: number;
  label: string;
}

function TimeUnit({ value, label }: TimeUnit) {
  const display = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <span
        className="text-xl font-bold text-[#EDEFF4] tabular-nums leading-none"
        style={{ fontFamily: "var(--font-mono-code)" }}
      >
        {display}
      </span>
      <span className="text-[8px] font-medium text-[#8A90A0] uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span
      className="text-[#2E6BFF]/40 text-base font-light leading-none mt-0.5 select-none flex-shrink-0"
      style={{ fontFamily: "var(--font-mono-code)" }}
    >
      :
    </span>
  );
}

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
}

export function CountdownTimer({ targetDate, compact = false }: CountdownTimerProps) {
  const [time, setTime] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getTimeRemaining(targetDate);
      setTime(next);
      if (next.total <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.total <= 0) {
    return (
      <p
        className="text-[#2E6BFF] text-center text-xs font-medium uppercase tracking-wider"
        style={{ fontFamily: "var(--font-mono-code)" }}
      >
        Sorteo finalizado
      </p>
    );
  }

  const units: TimeUnit[] = [
    { value: time.days, label: "días" },
    { value: time.hours, label: "horas" },
    { value: time.minutes, label: "min" },
    { value: time.seconds, label: "seg" },
  ];

  return (
    <div className={`flex items-start ${compact ? "gap-1" : "gap-2"}`}>
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-start gap-1 flex-1">
          <TimeUnit {...unit} />
          {i < units.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
