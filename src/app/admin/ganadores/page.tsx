"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCcw, Trophy } from "lucide-react";
import { WinnerForm } from "@/components/admin/winner-form";
import { Raffle, WinnerPublic } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminGanadoresPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [winners, setWinners] = useState<WinnerPublic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rafflesRes, winnersRes] = await Promise.all([
        fetch("/api/raffles"),
        fetch("/api/winners"),
      ]);
      const rafflesData = await rafflesRes.json();
      const winnersData = await winnersRes.json();
      setRaffles(rafflesData.raffles ?? []);
      setWinners(winnersData.winners ?? []);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-xl text-[#F5F5F0]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Ganadores
          </h1>
          <p className="text-xs text-[#A0A0A8] mt-0.5">Registrar ganador de un sorteo</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-md border border-[#2A2A33] text-[#A0A0A8] hover:text-[#C9A961] hover:border-[#C9A961]/40 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#3D3D48] to-transparent" />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#C9A961] animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-2xl">
          {/* Form */}
          <div className="rounded-md border border-[#2A2A33] bg-[#1C1C22] p-5">
            <h2 className="text-sm font-medium text-[#A0A0A8] uppercase tracking-wider mb-4">
              Registrar ganador
            </h2>
            <WinnerForm raffles={raffles} onSuccess={fetchData} />
          </div>

          {/* Registered winners */}
          {winners.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-[#A0A0A8] uppercase tracking-wider">
                Ganadores registrados
              </h2>
              <div className="flex flex-col gap-2">
                {winners.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-md border border-[#2A2A33] bg-[#1C1C22] p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-4 h-4 text-[#C9A961]" />
                      <div>
                        <p className="text-sm font-medium text-[#F5F5F0]">{w.masked_name}</p>
                        <p
                          className="text-xs text-[#C9A961]"
                          style={{ fontFamily: "var(--font-mono-code)" }}
                        >
                          {w.ticket_code}
                        </p>
                        <p className="text-xs text-[#A0A0A8]">{w.raffle_title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#A0A0A8]">Posición {w.position}</span>
                      <p className="text-xs text-[#A0A0A8]/60">{formatDate(w.drawn_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
