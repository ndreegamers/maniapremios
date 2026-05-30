"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCcw, Ticket, CreditCard, Trophy, Clock } from "lucide-react";
import { Raffle, PurchaseWithDetails } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}

function MetricCard({ label, value, icon, sub }: MetricCardProps) {
  return (
    <div className="rounded-md border border-[#2A2A33] bg-[#1C1C22] p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#A0A0A8] uppercase tracking-wider">{label}</span>
        <span className="text-[#C9A961]/60">{icon}</span>
      </div>
      <span
        className="text-2xl font-bold text-[#F5F5F0]"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-[#A0A0A8]/60">{sub}</span>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [purchasesRes, rafflesRes] = await Promise.all([
        fetch("/api/admin/purchases"),
        fetch("/api/raffles"),
      ]);

      const purchasesData = await purchasesRes.json();
      const rafflesData = await rafflesRes.json();

      setPurchases(purchasesData.purchases ?? []);
      setRaffles(rafflesData.raffles ?? []);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pendingCount = purchases.filter((p) => p.payment_status === "pending").length;
  const approvedCount = purchases.filter((p) => p.payment_status === "approved").length;
  const totalRevenue = purchases
    .filter((p) => p.payment_status === "approved")
    .reduce((sum, p) => sum + p.total_amount, 0);
  const activeRaffles = raffles.filter((r) => r.status === "active").length;

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-xl text-[#F5F5F0]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Dashboard
          </h1>
          <p className="text-xs text-[#A0A0A8] mt-0.5">Resumen general</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-md border border-[#2A2A33] text-[#A0A0A8] hover:text-[#C9A961] hover:border-[#C9A961]/40 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Ornamental divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#3D3D48] to-transparent" />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#C9A961] animate-spin" />
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Pagos pendientes"
              value={pendingCount}
              icon={<Clock className="w-4 h-4" />}
              sub={pendingCount > 0 ? "Requieren revisión" : "Todo al día"}
            />
            <MetricCard
              label="Pagos aprobados"
              value={approvedCount}
              icon={<CreditCard className="w-4 h-4" />}
            />
            <MetricCard
              label="Ingresos totales"
              value={formatCurrency(totalRevenue)}
              icon={<Ticket className="w-4 h-4" />}
            />
            <MetricCard
              label="Sorteos activos"
              value={activeRaffles}
              icon={<Trophy className="w-4 h-4" />}
            />
          </div>

          {/* Active raffles summary */}
          {raffles.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-[#A0A0A8] uppercase tracking-wider">
                Sorteos
              </h2>
              <div className="flex flex-col gap-2">
                {raffles.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md border border-[#2A2A33] bg-[#1C1C22] p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#F5F5F0]">{r.title}</p>
                      <p
                        className="text-xs text-[#C9A961]"
                        style={{ fontFamily: "var(--font-mono-code)" }}
                      >
                        {r.code_prefix}-XXXX · {formatCurrency(r.ticket_price)}/ticket
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        r.status === "active"
                          ? "text-[#0F7B5C] border-[#0F7B5C]/30 bg-[#0F7B5C]/10"
                          : "text-[#A0A0A8] border-[#2A2A33]"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
