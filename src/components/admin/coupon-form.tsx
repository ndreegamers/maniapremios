"use client";

import { useState } from "react";
import { Copy, Check, Loader2, Plus, Trash2, Tag } from "lucide-react";
import { Coupon } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CouponFormProps {
  coupons: Coupon[];
  onRefresh: () => void;
}

function CouponRow({ coupon, onDelete }: { coupon: Coupon; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Código copiado");
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar el cupón ${coupon.code}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons?id=${coupon.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Error al eliminar");
        return;
      }
      onDelete(coupon.id);
      toast.success("Cupón eliminado");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeleting(false);
    }
  }

  const isUsed = coupon.redeemed_at !== null;
  const redeemer = coupon.redeemer;

  return (
    <div
      className={cn(
        "rounded-md border p-3 flex items-start justify-between gap-3 transition-all",
        isUsed ? "border-[#1C1F27] bg-[#08090C]" : "border-[#1C1F27] bg-[#0F1116]"
      )}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span
          className={cn(
            "font-bold tracking-widest text-sm",
            isUsed ? "text-[#8A90A0]" : "text-[#2E6BFF]"
          )}
          style={{ fontFamily: "var(--font-mono-code)" }}
        >
          {coupon.code}
        </span>
        {isUsed ? (
          <span className="text-xs text-[#8A90A0]">
            Usado por{" "}
            {redeemer
              ? `${redeemer.first_name} ${redeemer.last_name} (DNI: ${redeemer.dni})`
              : "—"}{" "}
            · {coupon.redeemed_at ? new Date(coupon.redeemed_at).toLocaleDateString("es-PE") : ""}
          </span>
        ) : (
          <span className="text-xs text-[#0F7B5C]">Disponible</span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!isUsed && (
          <>
            <button
              onClick={handleCopy}
              title="Copiar código"
              className="p-1.5 rounded border border-[#1C1F27] text-[#8A90A0] hover:text-[#EDEFF4] hover:border-[#262A34] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Eliminar cupón"
              className="p-1.5 rounded border border-[#1C1F27] text-[#8A90A0] hover:text-[#7C2D2D] hover:border-[#7C2D2D]/30 transition-all disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </>
        )}
        {isUsed && (
          <span className="text-xs px-2 py-0.5 rounded border text-[#8A90A0] border-[#1C1F27]">
            Usado
          </span>
        )}
      </div>
    </div>
  );
}

export function CouponForm({ coupons: initialCoupons, onRefresh }: CouponFormProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al generar cupón");
        return;
      }
      onRefresh();
      const newCode = data.coupons?.[0]?.code;
      if (newCode) {
        await navigator.clipboard.writeText(newCode);
        toast.success(`Cupón generado: ${newCode} (copiado al portapapeles)`);
      } else {
        toast.success("Cupón generado");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setGenerating(false);
    }
  }

  function handleDelete(id: string) {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  // Separate available and used
  const available = coupons.filter((c) => !c.redeemed_at);
  const used = coupons.filter((c) => c.redeemed_at);

  return (
    <div className="flex flex-col gap-5">
      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="flex items-center gap-2 self-start px-4 py-2.5 rounded-md bg-[#2E6BFF] text-[#EDEFF4] text-sm font-semibold hover:bg-[#4F7FFF] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Generar cupón
          </>
        )}
      </button>

      {coupons.length === 0 ? (
        <div className="rounded-md border border-[#1C1F27] bg-[#0F1116] p-8 text-center flex flex-col items-center gap-2">
          <Tag className="w-8 h-8 text-[#262A34]" />
          <p className="text-sm text-[#8A90A0]">No hay cupones generados aún.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Available */}
          {available.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#8A90A0] uppercase tracking-wider">
                Disponibles ({available.length})
              </p>
              <div className="flex flex-col gap-2">
                {available.map((c) => (
                  <CouponRow key={c.id} coupon={c} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Used */}
          {used.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#8A90A0] uppercase tracking-wider">
                Canjeados ({used.length})
              </p>
              <div className="flex flex-col gap-2">
                {used.map((c) => (
                  <CouponRow key={c.id} coupon={c} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
