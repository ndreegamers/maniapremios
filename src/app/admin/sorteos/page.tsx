"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCcw, Plus, Pencil, ChevronDown, ChevronUp, Gift } from "lucide-react";
import { RaffleForm } from "@/components/admin/raffle-form";
import { Raffle } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminSorteosPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [showNewRaffle, setShowNewRaffle] = useState(false);

  const fetchRaffles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/raffles");
      const data = await res.json();
      setRaffles(data.raffles ?? []);
    } catch {
      toast.error("Error al cargar sorteos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRaffles(); }, [fetchRaffles]);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-xl text-[#EDEFF4]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sorteos
          </h1>
          <p className="text-xs text-[#8A90A0] mt-0.5">Gestión de sorteos activos</p>
        </div>
        <button
          onClick={fetchRaffles}
          className="p-2 rounded-md border border-[#1C1F27] text-[#8A90A0] hover:text-[#2E6BFF] hover:border-[#2E6BFF]/30 transition-all"
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
        <div className="flex flex-col gap-4">
          {/* Existing raffles */}
          {raffles.length > 0 && (
            <div className="flex flex-col gap-2">
              {raffles.map((r) => (
                <div
                  key={r.id}
                  className="rounded-md border border-[#1C1F27] bg-[#0F1116] p-4 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#EDEFF4] text-sm truncate">{r.title}</p>
                      {r.is_free && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-[#2E6BFF]/20 text-[#2E6BFF] bg-[#2E6BFF]/5 shrink-0">
                          <Gift className="w-3 h-3" />
                          GRATIS
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs text-[#8A90A0] mt-0.5"
                      style={{ fontFamily: "var(--font-mono-code)" }}
                    >
                      {r.code_prefix}-XXXX
                      {!r.is_free && ` · ${formatCurrency(r.ticket_price)}/ticket`}
                      {` · ${r.total_tickets} tickets`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded border",
                        r.status === "active"
                          ? "text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/5"
                          : "text-[#8A90A0] border-[#1C1F27]"
                      )}
                    >
                      {r.status}
                    </span>
                    <button
                      onClick={() => { setEditingRaffle(r); setShowNewRaffle(false); }}
                      className="p-1.5 rounded border border-[#1C1F27] text-[#8A90A0] hover:text-[#2E6BFF] hover:border-[#2E6BFF]/30 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit form */}
          {editingRaffle && (
            <div className="rounded-md border border-[#2E6BFF]/20 bg-[#0F1116] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1C1F27] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#2E6BFF]" />
                <span className="font-medium text-sm text-[#2E6BFF]">Editar sorteo</span>
              </div>
              <div className="p-4">
                <RaffleForm
                  editRaffle={editingRaffle}
                  onCreated={fetchRaffles}
                  onCancel={() => setEditingRaffle(null)}
                  onDeleted={() => {
                    setEditingRaffle(null);
                    fetchRaffles();
                  }}
                />
              </div>
            </div>
          )}

          {/* New raffle form */}
          {!editingRaffle && (
            <div className="rounded-md border border-[#1C1F27] bg-[#0F1116] overflow-hidden">
              <button
                onClick={() => setShowNewRaffle(!showNewRaffle)}
                className="w-full flex items-center justify-between p-4 text-sm font-medium text-[#8A90A0] hover:text-[#2E6BFF] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Crear nuevo sorteo
                </div>
                {showNewRaffle ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showNewRaffle && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 pb-4 border-t border-[#1C1F27] pt-4"
                >
                  <RaffleForm onCreated={() => { fetchRaffles(); setShowNewRaffle(false); }} />
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
