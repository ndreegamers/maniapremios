"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Ticket } from "lucide-react";
import { RaffleWithStats } from "@/lib/types";
import { CountdownTimer } from "@/components/countdown-timer";
import { ProgressBar } from "@/components/progress-bar";
import { formatCurrency } from "@/lib/utils";

interface FeaturedRaffleProps {
  raffle: RaffleWithStats;
}

export function FeaturedRaffle({ raffle }: FeaturedRaffleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full rounded-lg overflow-hidden border border-[#262A34] border-t-[#2E6BFF]/20 bg-gradient-to-b from-[#0F1116] to-[#14161C]"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Image */}
        <div className="relative w-full lg:w-[45%] aspect-[4/3] lg:aspect-auto overflow-hidden">
          <Image
            src={raffle.image_url}
            alt={raffle.title}
            fill
            className="object-cover transition-transform duration-700 hover:scale-103"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0F1116] hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1116] via-transparent to-transparent lg:hidden" />

          {/* Price badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#2E6BFF] text-[#08090C] rounded px-3 py-1.5">
            <Ticket className="w-3.5 h-3.5" />
            <span className="font-bold text-sm font-mono">{formatCurrency(raffle.ticket_price)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-5 justify-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[#2E6BFF] uppercase tracking-widest">
              Premio destacado
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#EDEFF4] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {raffle.title}
            </h2>
          </div>

          {raffle.description && (
            <p className="text-sm text-[#8A90A0] leading-relaxed line-clamp-2">
              {raffle.description}
            </p>
          )}

          {/* Countdown */}
          <div className="border border-[#1C1F27] rounded-md p-4 bg-[#14161C]">
            <p className="text-xs text-[#8A90A0] uppercase tracking-wider mb-3">
              El sorteo se realiza en
            </p>
            <CountdownTimer targetDate={raffle.draw_date} compact />
          </div>

          {/* Progress */}
          <ProgressBar
            soldPercentage={raffle.sold_percentage}
            totalTickets={raffle.total_tickets}
            ticketsSold={raffle.tickets_sold}
          />

          {/* CTA */}
          <div className="flex gap-3">
            <Link
              href={`/participar?raffle=${raffle.id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2E6BFF] text-[#08090C] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#4F7FFF] active:scale-[0.98]"
            >
              Participar en este sorteo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
