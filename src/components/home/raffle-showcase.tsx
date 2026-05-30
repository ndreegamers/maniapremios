"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Ticket } from "lucide-react";
import { RaffleWithStats } from "@/lib/types";
import { CountdownTimer } from "@/components/countdown-timer";
import { ProgressBar } from "@/components/progress-bar";
import { formatCurrency } from "@/lib/utils";

interface RaffleShowcaseProps {
  raffle: RaffleWithStats;
  index?: number;
}

export function RaffleShowcase({ raffle, index = 0 }: RaffleShowcaseProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
      className="group relative rounded-lg overflow-hidden border border-[#2A2A33] border-t-[#3D3D48] bg-gradient-to-b from-[#1C1C22] to-[#15151A] flex flex-col hover-lift"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={raffle.image_url}
          alt={raffle.title}
          fill
          className="object-cover group-hover:scale-103 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C22] via-[#1C1C22]/30 to-transparent" />

        {/* Price */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#C9A961] text-[#0B0B0D] rounded px-2 py-1">
          <Ticket className="w-3 h-3" />
          <span className="font-bold text-xs">{formatCurrency(raffle.ticket_price)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-4 flex-1">
        <h3
          className="font-bold text-base text-[#F5F5F0] leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {raffle.title}
        </h3>

        {/* Countdown */}
        <div className="bg-[#15151A] border border-[#2A2A33] rounded-md p-3">
          <CountdownTimer targetDate={raffle.draw_date} compact />
        </div>

        {/* Progress */}
        <ProgressBar
          soldPercentage={raffle.sold_percentage}
          totalTickets={raffle.total_tickets}
          ticketsSold={raffle.tickets_sold}
        />

        {/* CTA */}
        <Link
          href={`/participar?raffle=${raffle.id}`}
          className="mt-auto flex items-center justify-center gap-2 bg-[#C9A961] text-[#0B0B0D] font-semibold text-sm rounded-md py-2.5 transition-all hover:bg-[#E8D08B] active:scale-[0.98]"
        >
          Participar
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.article>
  );
}
