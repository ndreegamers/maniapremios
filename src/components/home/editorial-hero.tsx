"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Ticket, Trophy } from "lucide-react";

/**
 * Hero de encabezado de la página principal.
 * Rediseñado como header de sección estilo Forg1: fondo oscuro, acento azul neón,
 * tipografía grotesk, sin sorteo destacado.
 */
export function EditorialHero() {
  return (
    <section className="w-full border-b border-[#1C1F27] bg-[#08090C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 max-w-2xl"
        >
          <span className="section-label">Sorteos exclusivos · Perú</span>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#EDEFF4] leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Premios
            <br />
            <span className="text-[#2E6BFF]">extraordinarios.</span>
          </h1>

          <p className="text-base text-[#8A90A0] leading-relaxed max-w-md">
            Mecánica totalmente transparente. Compra tus tickets, sube tu comprobante
            y participa en nuestros sorteos con verificación manual.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link
              href="/verificar"
              className="flex items-center gap-2 text-sm font-medium text-[#8A90A0] hover:text-[#EDEFF4] transition-colors group"
            >
              <Ticket className="w-4 h-4 text-[#2E6BFF]" />
              Verificar mis tickets
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/ganadores"
              className="flex items-center gap-2 text-sm font-medium text-[#8A90A0] hover:text-[#EDEFF4] transition-colors group"
            >
              <Trophy className="w-4 h-4 text-[#2E6BFF]" />
              Ver ganadores anteriores
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
