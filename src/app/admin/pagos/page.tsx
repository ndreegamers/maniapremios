"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { PaymentQueue } from "@/components/admin/payment-queue";
import { PurchaseWithDetails } from "@/lib/types";
import { toast } from "sonner";

export default function AdminPagosPage() {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [receiptUrls, setReceiptUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/purchases");
      const data = await res.json();
      const fetched: PurchaseWithDetails[] = data.purchases ?? [];
      setPurchases(fetched);

      const urls: Record<string, string> = {};
      await Promise.all(
        fetched.map(async (p) => {
          if (p.receipt_url) {
            const r = await fetch(`/api/admin/receipt-url?path=${encodeURIComponent(p.receipt_url)}`);
            if (r.ok) {
              const { url } = await r.json();
              urls[p.id] = url;
            }
          }
        })
      );
      setReceiptUrls(urls);
    } catch {
      toast.error("Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pendingCount = purchases.filter((p) => p.payment_status === "pending").length;

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-bold text-xl text-[#F5F5F0]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Pagos pendientes
          </h1>
          {pendingCount > 0 && (
            <p className="text-xs text-[#B8860B] mt-0.5">
              {pendingCount} pago{pendingCount !== 1 ? "s" : ""} por revisar
            </p>
          )}
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
        <PaymentQueue
          purchases={purchases.filter((p) => p.payment_status === "pending")}
          receiptUrls={receiptUrls}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}
