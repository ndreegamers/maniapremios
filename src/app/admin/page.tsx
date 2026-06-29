"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCcw, Ticket, CreditCard, Trophy, Clock, ChevronRight } from "lucide-react";
import { RaffleStats } from "@/lib/types";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { toast } from "sonner";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}

function MetricCard({ label, value, icon, sub }: MetricCardProps) {
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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<RaffleStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Error al cargar estadísticas");
      const data: RaffleStats = await res.json();
      setStats(data);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeRaffles = stats?.perRaffle.filter((r) => r.status === "active").length ?? 0;

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-xl text-[#EDEFF4]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dashboard
          </h1>
          <p className="text-xs text-[#8A90A0] mt-0.5">Resumen general</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-md border border-[#1C1F27] text-[#8A90A0] hover:text-[#2E6BFF] hover:border-[#2E6BFF]/40 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Ornamental divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#1C1F27] to-transparent" />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#2E6BFF] animate-spin" />
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Pagos pendientes"
              value={stats?.pendingCount ?? 0}
              icon={<Clock className="w-4 h-4" />}
              sub={(stats?.pendingCount ?? 0) > 0 ? "Requieren revisión" : "Todo al día"}
            />
            <MetricCard
              label="Pagos aprobados"
              value={stats?.approvedCount ?? 0}
              icon={<CreditCard className="w-4 h-4" />}
            />
            <MetricCard
              label="Ingresos totales"
              value={formatCurrency(stats?.totalRevenue ?? 0)}
              icon={<Ticket className="w-4 h-4" />}
              sub="Solo pagos Yape aprobados"
            />
            <MetricCard
              label="Sorteos activos"
              value={activeRaffles}
              icon={<Trophy className="w-4 h-4" />}
            />
          </div>

          {/* Raffles list — clickable */}
          {(stats?.perRaffle.length ?? 0) > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-[#8A90A0] uppercase tracking-wider">
                Sorteos
              </h2>
              <div className="flex flex-col gap-2">
                {stats!.perRaffle.map((r) => (
                  <Link
                    key={r.raffle_id}
                    href={`/admin/sorteos/${r.raffle_id}`}
                    className="rounded-md border border-[#1C1F27] bg-[#0F1116] p-3 flex items-center justify-between hover:border-[#2E6BFF]/30 hover:bg-[#0F1116]/80 transition-all group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-[#EDEFF4] group-hover:text-[#2E6BFF] transition-colors">
                        {r.title}
                      </p>
                      <p
                        className="text-xs text-[#2E6BFF]"
                        style={{ fontFamily: "var(--font-mono-code)" }}
                      >
                        {r.participants} participantes · {formatCurrency(r.revenue)} recaudado
                      </p>
                      <p className="text-xs text-[#8A90A0]">
                        Cierra: {formatDateShort(r.draw_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${
                          r.status === "active"
                            ? "text-[#0F7B5C] border-[#0F7B5C]/30 bg-[#0F7B5C]/10"
                            : "text-[#8A90A0] border-[#1C1F27]"
                        }`}
                      >
                        {r.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#8A90A0] group-hover:text-[#2E6BFF] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
