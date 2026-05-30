"use client";

import { useState } from "react";
import { Loader2, Trophy, Check } from "lucide-react";
import { toast } from "sonner";
import { Raffle } from "@/lib/types";

interface WinnerFormProps {
  raffles: Raffle[];
  onSuccess: () => void;
}

const inputClass =
  "w-full bg-[#15151A] border border-[#2A2A33] rounded-md px-4 py-3 text-[#F5F5F0] focus:outline-none focus:border-[#C9A961] transition-all placeholder:text-[#3D3D48]";

const labelClass = "text-xs font-medium text-[#A0A0A8] uppercase tracking-widest";

export function WinnerForm({ raffles, onSuccess }: WinnerFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    raffle_id: "",
    ticket_code: "",
    position: "1",
    prize_description: "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.raffle_id || !form.ticket_code || !form.position) {
      toast.error("Completa los campos requeridos");
      return;
    }

    const ticketCodePattern = /^[A-Z]{2,3}-\d{4}-[A-Z0-9]{3}$/i;
    if (!ticketCodePattern.test(form.ticket_code.trim())) {
      toast.error("El código de ticket debe tener el formato DTM-0001-X7K");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/winners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffle_id: form.raffle_id,
          ticket_code: form.ticket_code.trim().toUpperCase(),
          position: parseInt(form.position, 10),
          prize_description: form.prize_description || undefined,
          notes: form.notes || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Ganador registrado exitosamente");
        setForm({ raffle_id: "", ticket_code: "", position: "1", prize_description: "", notes: "" });
        onSuccess();
      } else {
        toast.error(data.error ?? "Error al registrar ganador");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className={labelClass}>Sorteo *</label>
          <select
            value={form.raffle_id}
            onChange={(e) => set("raffle_id", e.target.value)}
            className={inputClass}
          >
            <option value="">Seleccionar sorteo...</option>
            {raffles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className={labelClass}>Código de ticket ganador *</label>
          <input
            type="text"
            value={form.ticket_code}
            onChange={(e) => set("ticket_code", e.target.value.toUpperCase())}
            placeholder="DTM-0001-X7K"
            className={inputClass + " uppercase tracking-widest"}
            style={{ fontFamily: "var(--font-mono-code)" }}
          />
          <p className="text-xs text-[#A0A0A8]/60">Formato: PREFIJO-NNNN-HHH (ej: DTM-0042-A3F)</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Posición *</label>
          <select
            value={form.position}
            onChange={(e) => set("position", e.target.value)}
            className={inputClass}
          >
            <option value="1">1er Premio</option>
            <option value="2">2do Premio</option>
            <option value="3">3er Premio</option>
            <option value="4">4to Premio</option>
            <option value="5">5to Premio</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Descripción del premio</label>
          <input
            type="text"
            value={form.prize_description}
            onChange={(e) => set("prize_description", e.target.value)}
            placeholder="iPhone 16 Pro Max..."
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className={labelClass}>Notas internas</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Observaciones del sorteo..."
            rows={2}
            className={inputClass + " resize-none"}
          />
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-[#B8860B]/10 border border-[#B8860B]/20 rounded-md px-4 py-3">
        <Trophy className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
        <p className="text-xs text-[#B8860B]/80">
          Al registrar el ganador del 1er Premio, el sorteo se marcará automáticamente como completado y el ganador aparecerá en la página pública.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-[#C9A961] text-[#0B0B0D] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#E8D08B] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        {loading ? "Registrando..." : "Registrar ganador"}
      </button>
    </form>
  );
}
