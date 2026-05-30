"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCcw, Plus, Pencil, ChevronDown, ChevronUp } from "lucide-react";
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
            className="font-bold text-xl text-[#F5F5F0]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Sorteos
          </h1>
          <p className="text-xs text-[#A0A0A8] mt-0.5">Gestión de sorteos activos</p>
        </div>
        <button
          onClick={fetchRaffles}
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
        <div className="flex flex-col gap-4">
          {/* Existing raffles */}
          {raffles.length > 0 && (
            <div className="flex flex-col gap-2">
              {raffles.map((r) => (
                <div
                  key={r.id}
                  className="rounded-md border border-[#2A2A33] bg-[#1C1C22] p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-[#F5F5F0] text-sm">{r.title}</p>
                    <p
                      className="text-xs text-[#C9A961] mt-0.5"
                      style={{ fontFamily: "var(--font-mono-code)" }}
                    >
                      {r.code_prefix}-XXXX · {formatCurrency(r.ticket_price)}/ticket · {r.total_tickets} total
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded border",
                        r.status === "active"
                          ? "text-[#0F7B5C] border-[#0F7B5C]/30 bg-[#0F7B5C]/10"
                          : "text-[#A0A0A8] border-[#2A2A33]"
                      )}
                    >
                      {r.status}
                    </span>
                    <button
                      onClick={() => { setEditingRaffle(r); setShowNewRaffle(false); }}
                      className="p-1.5 rounded border border-[#2A2A33] text-[#A0A0A8] hover:text-[#C9A961] hover:border-[#C9A961]/40 transition-all"
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
            <div className="rounded-md border border-[#C9A961]/20 bg-[#1C1C22] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2A2A33] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#C9A961]" />
                <span className="font-medium text-sm text-[#C9A961]">Editar sorteo</span>
              </div>
              <div className="p-4">
                <RaffleForm
                  editRaffle={editingRaffle}
                  onCreated={fetchRaffles}
                  onCancel={() => setEditingRaffle(null)}
                />
              </div>
            </div>
          )}

          {/* New raffle form */}
          {!editingRaffle && (
            <div className="rounded-md border border-[#2A2A33] bg-[#1C1C22] overflow-hidden">
              <button
                onClick={() => setShowNewRaffle(!showNewRaffle)}
                className="w-full flex items-center justify-between p-4 text-sm font-medium text-[#F5F5F0] hover:text-[#C9A961] transition-colors"
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
                  className="px-4 pb-4 border-t border-[#2A2A33] pt-4"
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
