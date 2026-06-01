"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Ticket, Gift } from "lucide-react";
import { RaffleWithStats } from "@/lib/types";
import { CountdownTimer } from "@/components/countdown-timer";
import { formatCurrency } from "@/lib/utils";

interface RaffleShowcaseProps {
  raffle: RaffleWithStats;
  index?: number;
}

export function RaffleShowcase({ raffle, index = 0 }: RaffleShowcaseProps) {
  // Cap stagger delay so 5-column grids don't feel slow
  const delay = 0.05 + Math.min(index, 6) * 0.06;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="group relative rounded-xl overflow-hidden neon-border card-base flex flex-col neon-glow-hover w-full"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={raffle.image_url}
          alt={raffle.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1116] via-[#0F1116]/20 to-transparent" />

        {/* Price / Free badge */}
        {raffle.is_free ? (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#2E6BFF] text-[#EDEFF4] rounded px-2 py-1">
            <Gift className="w-3 h-3" />
            <span className="font-bold text-xs tracking-wider">GRATIS</span>
          </div>
        ) : (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#14161C] border border-[#2E6BFF]/30 text-[#2E6BFF] rounded px-2 py-1">
            <Ticket className="w-3 h-3" />
            <span className="font-bold text-xs" style={{ fontFamily: "var(--font-mono-code)" }}>
              {formatCurrency(raffle.ticket_price)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        <h3
          className="font-bold text-base text-[#EDEFF4] leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {raffle.title}
        </h3>

        {/* Countdown */}
        <div className="bg-[#14161C] border border-[#1C1F27] rounded-md p-2.5">
          <CountdownTimer targetDate={raffle.draw_date} compact />
        </div>

        {/* CTA */}
        <Link
          href={`/participar?raffle=${raffle.id}`}
          className="mt-auto flex items-center justify-center gap-2 bg-[#2E6BFF] text-[#EDEFF4] font-semibold text-sm rounded-lg py-3 transition-all hover:bg-[#4F7FFF] active:scale-[0.98] tracking-wide"
        >
          {raffle.is_free ? "Participar gratis" : "Participar"}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.article>
  );
}
