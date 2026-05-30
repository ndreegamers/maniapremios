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
      className="relative w-full rounded-lg overflow-hidden border border-[#3D3D48] border-t-[#C9A961]/20 bg-gradient-to-b from-[#1C1C22] to-[#15151A]"
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
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#1C1C22] hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C22] via-transparent to-transparent lg:hidden" />

          {/* Price badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#C9A961] text-[#0B0B0D] rounded px-3 py-1.5">
            <Ticket className="w-3.5 h-3.5" />
            <span className="font-bold text-sm font-mono">{formatCurrency(raffle.ticket_price)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-5 justify-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[#C9A961] uppercase tracking-widest">
              Premio destacado
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {raffle.title}
            </h2>
          </div>

          {raffle.description && (
            <p className="text-sm text-[#A0A0A8] leading-relaxed line-clamp-2">
              {raffle.description}
            </p>
          )}

          {/* Countdown */}
          <div className="border border-[#2A2A33] rounded-md p-4 bg-[#15151A]">
            <p className="text-xs text-[#A0A0A8] uppercase tracking-wider mb-3">
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
              className="flex-1 flex items-center justify-center gap-2 bg-[#C9A961] text-[#0B0B0D] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#E8D08B] active:scale-[0.98]"
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
