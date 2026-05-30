"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Loader2, ArrowLeft } from "lucide-react";
import { WinnerCard } from "@/components/winner-card";
import { WinnerPublic } from "@/lib/types";

export function GanadoresContent() {
  const [winners, setWinners] = useState<WinnerPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWinners() {
      try {
        const res = await fetch("/api/winners");
        if (res.ok) {
          const data = await res.json();
          setWinners(data.winners ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchWinners();
  }, []);

  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#A0A0A8] hover:text-[#F5F5F0] text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <span className="text-xs font-medium text-[#C9A961] uppercase tracking-widest">
            Historial
          </span>
          <h1
            className="font-bold text-2xl sm:text-3xl text-[#F5F5F0]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Ganadores
          </h1>
          <p className="text-[#A0A0A8] text-sm">
            Sorteos completados con verificación transparente
          </p>
        </motion.div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3D3D48] to-transparent" />
          <span className="text-[#3D3D48] text-xs">◆</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3D3D48] to-transparent" />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#C9A961] animate-spin" />
          </div>
        ) : winners.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <Trophy className="w-12 h-12 text-[#3D3D48]" />
            <div>
              <p className="text-[#A0A0A8] text-sm">
                Aún no hay ganadores registrados.
              </p>
              <p className="text-[#A0A0A8]/50 text-xs mt-1">
                Los ganadores aparecerán aquí tras completarse un sorteo.
              </p>
            </div>
            <Link
              href="/"
              className="mt-2 flex items-center gap-2 bg-[#C9A961] text-[#0B0B0D] font-semibold text-sm rounded-md px-5 py-2 transition-all hover:bg-[#E8D08B]"
            >
              Ver sorteos activos
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {winners.map((winner, i) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <WinnerCard winner={winner} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
