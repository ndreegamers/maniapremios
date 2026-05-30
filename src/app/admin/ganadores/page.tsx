"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCcw, Trophy, Trash2 } from "lucide-react";
import { WinnerForm } from "@/components/admin/winner-form";
import { Raffle, WinnerPublic } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminGanadoresPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [winners, setWinners] = useState<WinnerPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDelete(winner: WinnerPublic) {
    if (!confirm(`¿Eliminar a "${winner.masked_name}" (${winner.ticket_code}) como ganador?\n\nSi era posición 1, el sorteo volverá a estado "activo".`)) return;

    setDeletingId(winner.id);
    try {
      const res = await fetch(`/api/winners/${winner.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Ganador eliminado");
        fetchData();
      } else {
        toast.error(data.error ?? "Error al eliminar ganador");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-xl text-[#EDEFF4]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ganadores
          </h1>
          <p className="text-xs text-[#8A90A0] mt-0.5">Registrar y gestionar ganadores</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-md border border-[#1C1F27] text-[#8A90A0] hover:text-[#2E6BFF] hover:border-[#2E6BFF]/40 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="h-px bg-[#1C1F27]" />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#2E6BFF] animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-2xl">
          {/* Form */}
          <div className="rounded-md border border-[#1C1F27] bg-[#0F1116] p-5">
            <span className="section-label mb-4 block">Registrar ganador</span>
            <WinnerForm raffles={raffles} onSuccess={fetchData} />
          </div>

          {/* Registered winners */}
          {winners.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="section-label">Ganadores registrados</span>
              <div className="flex flex-col gap-2">
                {winners.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-md border border-[#1C1F27] bg-[#0F1116] p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Trophy className="w-4 h-4 text-[#2E6BFF] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#EDEFF4] truncate">{w.masked_name}</p>
                        <p
                          className="text-xs text-[#2E6BFF]"
                          style={{ fontFamily: "var(--font-mono-code)" }}
                        >
                          {w.ticket_code}
                        </p>
                        <p className="text-xs text-[#8A90A0] truncate">{w.raffle_title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-[#8A90A0] block">Posición {w.position}</span>
                        <p className="text-xs text-[#8A90A0]/60">{formatDate(w.drawn_at)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(w)}
                        disabled={deletingId === w.id}
                        className="p-1.5 rounded border border-[#1C1F27] text-[#8A90A0] hover:text-[#7C2D2D] hover:border-[#7C2D2D]/40 transition-all disabled:opacity-40"
                        title="Eliminar ganador"
                      >
                        {deletingId === w.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
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
