"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Loader2, ArrowLeft, Ticket } from "lucide-react";
import { TicketList } from "@/components/ticket-list";
import { VerifyResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VerificarContent() {
  const searchParams = useSearchParams();
  const initialDni = searchParams.get("dni") ?? "";

  const [dni, setDni] = useState(initialDni);
  const [inputVal, setInputVal] = useState(initialDni);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialDni && /^\d{8}$/.test(initialDni)) {
      handleSearch(initialDni);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(searchDni = dni) {
    if (!/^\d{8}$/.test(searchDni)) return;

    setLoading(true);
    setSearched(false);

    try {
      const res = await fetch(`/api/tickets/verify?dni=${searchDni}`);
      const data: VerifyResult = await res.json();
      setResult(data);
      setSearched(true);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
    setInputVal(val);
    setDni(val);
    if (searched) {
      setSearched(false);
      setResult(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
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
            Verificación
          </span>
          <h1
            className="font-bold text-2xl sm:text-3xl text-[#F5F5F0]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Mis Tickets
          </h1>
          <p className="text-[#A0A0A8] text-sm">
            Ingresa tu DNI para consultar tus boletos
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-[#2A2A33] bg-[#1C1C22] p-5 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#A0A0A8] uppercase tracking-widest">
              Número de DNI
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              maxLength={8}
              placeholder="12345678"
              className="w-full bg-[#15151A] border border-[#2A2A33] rounded-md px-4 py-3 text-[#F5F5F0] font-bold text-2xl tracking-[0.3em] text-center focus:outline-none focus:border-[#C9A961] transition-all"
              style={{ fontFamily: "var(--font-mono-code)" }}
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading || inputVal.length !== 8}
            className={cn(
              "w-full flex items-center justify-center gap-2 font-semibold text-sm rounded-md py-3 transition-all duration-200",
              inputVal.length === 8 && !loading
                ? "bg-[#C9A961] text-[#0B0B0D] hover:bg-[#E8D08B]"
                : "bg-[#2A2A33] text-[#3D3D48] cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Buscar mis tickets
              </>
            )}
          </button>
        </motion.div>

        {/* Results */}
        {searched && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[#2A2A33] bg-[#1C1C22] p-5"
          >
            <TicketList result={result} />
          </motion.div>
        )}

        {/* CTA when no results */}
        {(!searched || (result?.tickets.length === 0 && result?.pending_purchases === 0)) && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <Ticket className="w-8 h-8 text-[#3D3D48]" />
            <p className="text-[#A0A0A8] text-sm text-center">¿Aún no tienes tickets?</p>
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#C9A961] text-[#0B0B0D] font-semibold text-sm rounded-md px-5 py-2 transition-all hover:bg-[#E8D08B]"
            >
              <Ticket className="w-3.5 h-3.5" />
              Participar ahora
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
