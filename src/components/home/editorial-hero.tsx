"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { FeaturedRaffle } from "@/components/home/featured-raffle";
import { RaffleWithStats } from "@/lib/types";

interface EditorialHeroProps {
  featuredRaffle: RaffleWithStats | null;
}

export function EditorialHero({ featuredRaffle }: EditorialHeroProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        {/* Left — editorial headline */}
        <div className="lg:w-[38%] flex flex-col gap-6 lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4"
          >
            <span className="text-xs font-medium text-[#C9A961] uppercase tracking-widest">
              Sorteos exclusivos · Perú
            </span>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F5F5F0] leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Premios
              <br />
              <span className="italic text-[#C9A961]">extraordinarios</span>
            </h1>

            <p className="text-base text-[#A0A0A8] leading-relaxed max-w-sm">
              Mecánica totalmente transparente. Compra tus tickets, sube tu comprobante
              y participa en nuestros sorteos con verificación manual.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            <Link
              href="/verificar"
              className="w-fit flex items-center gap-2 text-sm text-[#A0A0A8] hover:text-[#F5F5F0] transition-colors"
            >
              <Ticket className="w-4 h-4 text-[#C9A961]" />
              Verificar mis tickets
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/ganadores"
              className="w-fit flex items-center gap-2 text-sm text-[#A0A0A8] hover:text-[#F5F5F0] transition-colors"
            >
              <span className="text-[#C9A961]">◆</span>
              Ver ganadores anteriores
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-px bg-gradient-to-r from-[#3D3D48] to-transparent" />
            <span className="text-[#3D3D48] text-xs">◆</span>
          </div>

          <p className="text-xs text-[#A0A0A8]/50">
            Pago vía Yape · Solo Perú
          </p>
        </div>

        {/* Right — featured raffle */}
        <div className="flex-1 w-full">
          {featuredRaffle ? (
            <FeaturedRaffle raffle={featuredRaffle} />
          ) : (
            <div className="rounded-lg border border-[#2A2A33] bg-gradient-to-b from-[#1C1C22] to-[#15151A] p-12 flex flex-col items-center gap-4 text-center">
              <span className="text-[#3D3D48] text-3xl">◆</span>
              <p className="text-[#A0A0A8] text-sm">
                Próximamente nuevos sorteos. ¡Vuelve pronto!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
