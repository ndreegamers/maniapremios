"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Loader2,
  Users,
  Ticket,
  Calendar,
  DollarSign,
  Pencil,
  RefreshCcw,
} from "lucide-react";
import { RaffleStatRow } from "@/lib/types";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { toast } from "sonner";

function StatBox({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-md border border-[#1C1F27] bg-[#0F1116] p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8A90A0] uppercase tracking-wider">{label}</span>
        <span className="text-[#2E6BFF]/60">{icon}</span>
      </div>
      <span
        className="text-2xl font-bold text-[#EDEFF4]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-[#8A90A0]/60">{sub}</span>}
    </div>
  );
}

export default function RaffleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const raffleId = params.id as string;

  const [raffle, setRaffle] = useState<RaffleStatRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Error al cargar datos");
      const data = await res.json();
      const found = (data.perRaffle as RaffleStatRow[]).find(
        (r) => r.raffle_id === raffleId
      );
      if (!found) {
        toast.error("Sorteo no encontrado");
        router.push("/admin");
        return;
      }
      setRaffle(found);
    } catch {
      toast.error("Error al cargar el sorteo");
    } finally {
      setLoading(false);
    }
  }, [raffleId, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/raffles/${raffleId}/participants`);
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Error al descargar");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.split('filename="')[1]?.replace('"', "") ??
        "participantes.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Excel descargado");
    } catch {
      toast.error("Error al descargar el archivo");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 text-[#2E6BFF] animate-spin" />
      </div>
    );
  }

  if (!raffle) return null;

  const soldPct =
    raffle.total_tickets > 0
      ? Math.min(100, (raffle.tickets_sold / raffle.total_tickets) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2 rounded-md border border-[#1C1F27] text-[#8A90A0] hover:text-[#EDEFF4] hover:border-[#262A34] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1
            className="font-bold text-xl text-[#EDEFF4] truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {raffle.title}
          </h1>
          <p className="text-xs text-[#8A90A0] mt-0.5">Detalle del sorteo</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-md border border-[#1C1F27] text-[#8A90A0] hover:text-[#2E6BFF] hover:border-[#2E6BFF]/40 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Status + date */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`text-xs px-2.5 py-1 rounded border font-medium ${
            raffle.status === "active"
              ? "text-[#0F7B5C] border-[#0F7B5C]/30 bg-[#0F7B5C]/10"
              : "text-[#8A90A0] border-[#1C1F27] bg-[#0F1116]"
          }`}
        >
          {raffle.status === "active" ? "Activo" : raffle.status}
        </span>
        {raffle.is_free && (
          <span className="text-xs px-2.5 py-1 rounded border text-[#2E6BFF] border-[#2E6BFF]/30 bg-[#2E6BFF]/10 font-medium">
            GRATIS
          </span>
        )}
        <div className="flex items-center gap-1.5 text-[#8A90A0] text-sm">
          <Calendar className="w-3.5 h-3.5" />
          <span>Fecha del sorteo: </span>
          <span
            className="text-[#2E6BFF]"
            style={{ fontFamily: "var(--font-mono-code)" }}
          >
            {formatDateShort(raffle.draw_date)}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          label="Participantes"
          value={raffle.participants}
          icon={<Users className="w-4 h-4" />}
          sub="Con al menos 1 ticket"
        />
        <StatBox
          label="Tickets vendidos"
          value={`${raffle.tickets_sold} / ${raffle.total_tickets}`}
          icon={<Ticket className="w-4 h-4" />}
          sub={`${soldPct}% vendido`}
        />
        <StatBox
          label="Total recaudado"
          value={formatCurrency(raffle.revenue)}
          icon={<DollarSign className="w-4 h-4" />}
          sub="Solo pagos aprobados"
        />
        <StatBox
          label="Tickets disponibles"
          value={Math.max(0, raffle.total_tickets - raffle.tickets_sold)}
          icon={<Ticket className="w-4 h-4" />}
          sub="Quedan por vender"
        />
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-[#8A90A0]">
          <span>Progreso de venta</span>
          <span
            className="text-[#2E6BFF]"
            style={{ fontFamily: "var(--font-mono-code)" }}
          >
            {soldPct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#1C1F27] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#2E6BFF] transition-all"
            style={{ width: `${soldPct}%` }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading || raffle.tickets_sold === 0}
          className="flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#0F7B5C]/10 border-[#0F7B5C]/30 text-[#0F7B5C] hover:bg-[#0F7B5C]/20"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? "Generando Excel..." : "Descargar participantes (.xlsx)"}
        </button>

        <Link
          href={`/admin/sorteos?edit=${raffle.raffle_id}`}
          className="flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold border border-[#1C1F27] text-[#8A90A0] hover:text-[#EDEFF4] hover:border-[#262A34] transition-all px-5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Pencil className="w-4 h-4" />
          Editar sorteo
        </Link>
      </div>

      {raffle.tickets_sold === 0 && (
        <p className="text-xs text-[#8A90A0] text-center">
          Aún no hay tickets vendidos — el Excel estará disponible cuando haya participantes.
        </p>
      )}
    </div>
  );
}
