"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Check, Copy, Trash2, Share2, User } from "lucide-react";
import { toast } from "sonner";

interface ReferralCode {
  id: string;
  code: string;
  created_at: string;
  participant: {
    id: string;
    dni: string;
    first_name: string;
    last_name: string;
  } | null;
  uses_count: number;
}

interface ReferralFormProps {
  codes: ReferralCode[];
  onRefresh: () => void;
}

export function ReferralForm({ codes, onRefresh }: ReferralFormProps) {
  const [dni, setDni] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundParticipant, setFoundParticipant] = useState<{
    name: string;
    dni: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSearch() {
    if (!/^\d{8}$/.test(dni)) {
      toast.error("Ingresa un DNI válido de 8 dígitos");
      return;
    }
    setSearching(true);
    setFoundParticipant(null);
    try {
      const res = await fetch(`/api/dni?dni=${dni}`);
      const data = await res.json();
      if (data.success && data.first_name) {
        setFoundParticipant({ name: `${data.first_name} ${data.last_name}`, dni });
      } else {
        toast.error("Usuario no encontrado. Debe estar registrado en el sistema.");
      }
    } catch {
      toast.error("Error al buscar usuario");
    } finally {
      setSearching(false);
    }
  }

  async function handleAssign() {
    if (!foundParticipant) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: foundParticipant.dni, code: customCode || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Código "${data.code}" asignado a ${foundParticipant.name}`);
        setDni("");
        setCustomCode("");
        setFoundParticipant(null);
        onRefresh();
      } else {
        toast.error(data.error ?? "Error al asignar código");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, code: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/referrals?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Código "${code}" revocado`);
        onRefresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al revocar código");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeletingId(null);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success(`Código "${code}" copiado`);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Assign form ────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#1C1F27] bg-[#0F1116] p-6">
        <h2
          className="font-bold text-[#EDEFF4] text-lg mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Asignar código de referido
        </h2>
        <p className="text-[#8A90A0] text-sm mb-5">
          Busca un usuario registrado por DNI y asígnale un código de referido único.
        </p>

        <div className="flex flex-col gap-4">
          {/* DNI Search */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#8A90A0] uppercase tracking-widest">
              DNI del usuario
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={dni}
                onChange={(e) => {
                  setDni(e.target.value.replace(/\D/g, "").slice(0, 8));
                  setFoundParticipant(null);
                }}
                placeholder="12345678"
                className="flex-1 bg-[#14161C] border border-[#1C1F27] rounded-md px-4 py-3 text-[#EDEFF4] focus:outline-none focus:border-[#2E6BFF] transition-all placeholder:text-[#262A34]"
                style={{ fontFamily: "var(--font-mono-code)" }}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching || dni.length !== 8}
                className="flex items-center gap-2 px-4 py-3 bg-[#14161C] border border-[#1C1F27] rounded-md text-sm text-[#8A90A0] hover:text-[#EDEFF4] hover:border-[#262A34] transition-all disabled:opacity-40"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Buscar
              </button>
            </div>
          </div>

          <AnimatePresence>
            {foundParticipant && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-[#2E6BFF]/10 border border-[#2E6BFF]/20 rounded-md px-4 py-3"
              >
                <User className="w-4 h-4 text-[#2E6BFF] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#EDEFF4]">{foundParticipant.name}</p>
                  <p className="text-xs text-[#8A90A0]" style={{ fontFamily: "var(--font-mono-code)" }}>
                    DNI {foundParticipant.dni}
                  </p>
                </div>
                <Check className="w-4 h-4 text-[#2E6BFF] shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom code (optional) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#8A90A0] uppercase tracking-widest flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              Código personalizado <span className="normal-case text-[#262A34] tracking-normal">(opcional — se autogenera si lo dejas vacío)</span>
            </label>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))}
              placeholder="ANGEL92"
              className="w-full bg-[#14161C] border border-[#1C1F27] rounded-md px-4 py-3 text-[#EDEFF4] focus:outline-none focus:border-[#2E6BFF] transition-all placeholder:text-[#262A34] uppercase"
              style={{ fontFamily: "var(--font-mono-code)" }}
            />
          </div>

          <button
            type="button"
            onClick={handleAssign}
            disabled={!foundParticipant || submitting}
            className="flex items-center justify-center gap-2 bg-[#2E6BFF] text-[#EDEFF4] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#4F7FFF] disabled:opacity-40 disabled:cursor-not-allowed tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Asignando...</>
            ) : (
              <><Share2 className="w-4 h-4" /> Asignar código</>
            )}
          </button>
        </div>
      </div>

      {/* ── Existing codes list ─────────────────────────────────── */}
      <div className="rounded-lg border border-[#1C1F27] bg-[#0F1116] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1C1F27]">
          <span className="section-label">Códigos activos</span>
          <span className="ml-3 text-xs text-[#8A90A0]" style={{ fontFamily: "var(--font-mono-code)" }}>
            {codes.length} total
          </span>
        </div>

        {codes.length === 0 ? (
          <div className="px-6 py-10 text-center text-[#8A90A0] text-sm">
            No hay códigos asignados todavía.
          </div>
        ) : (
          <div className="divide-y divide-[#1C1F27]">
            {codes.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="px-6 py-4 flex items-center gap-4"
              >
                <span className="index-number w-6 text-right shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-[#2E6BFF] tracking-widest"
                      style={{ fontFamily: "var(--font-mono-code)" }}
                    >
                      {item.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(item.code)}
                      className="text-[#8A90A0] hover:text-[#EDEFF4] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#8A90A0] mt-0.5">
                    {item.participant
                      ? `${item.participant.first_name} ${item.participant.last_name} · DNI ${item.participant.dni}`
                      : "Sin usuario asociado"}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p
                      className="text-lg font-bold text-[#EDEFF4]"
                      style={{ fontFamily: "var(--font-mono-code)" }}
                    >
                      {item.uses_count}
                    </p>
                    <p className="text-[9px] text-[#8A90A0] uppercase tracking-wider">usos</p>
                  </div>

                  <div className={`text-center px-2 py-1 rounded border text-[10px] font-medium uppercase tracking-wider ${
                    item.uses_count >= 5
                      ? "border-[#7C2D2D]/40 text-[#7C2D2D] bg-[#7C2D2D]/5"
                      : "border-[#2E6BFF]/20 text-[#2E6BFF] bg-[#2E6BFF]/5"
                  }`}>
                    {item.uses_count >= 5 ? "Cap alcanzado" : `${5 - item.uses_count} restantes`}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.code)}
                    disabled={deletingId === item.id}
                    className="text-[#8A90A0] hover:text-[#7C2D2D] transition-colors disabled:opacity-40"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
