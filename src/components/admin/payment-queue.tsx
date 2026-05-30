"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, ExternalLink, Loader2,
  User, Ticket, CreditCard, Calendar
} from "lucide-react";
import { PurchaseWithDetails } from "@/lib/types";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentQueueProps {
  purchases: PurchaseWithDetails[];
  receiptUrls: Record<string, string>;
  onRefresh: () => void;
}

export function PaymentQueue({ purchases, receiptUrls, onRefresh }: PaymentQueueProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleAction(purchaseId: string, action: "approve" | "reject") {
    setProcessing(purchaseId);
    try {
      const res = await fetch(`/api/payments/${purchaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(action === "approve" ? "Pago aprobado y tickets asignados" : "Pago rechazado");
        onRefresh();
      } else {
        toast.error(data.error ?? "Error al procesar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setProcessing(null);
    }
  }

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Clock className="w-10 h-10 text-[#3D3D48]" />
        <p className="text-[#A0A0A8] text-sm">No hay pagos pendientes</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {purchases.map((purchase) => {
          const isProcessing = processing === purchase.id;
          const isExpanded = expanded === purchase.id;
          const receiptUrl = receiptUrls[purchase.id];

          return (
            <motion.div
              key={purchase.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-md border border-[#2A2A33] bg-[#1C1C22] overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#A0A0A8] shrink-0" />
                      <span className="font-medium text-[#F5F5F0] text-sm truncate">
                        {purchase.participant?.first_name} {purchase.participant?.last_name}
                      </span>
                    </div>
                    <span
                      className="text-[#C9A961] text-xs tracking-wider"
                      style={{ fontFamily: "var(--font-mono-code)" }}
                    >
                      DNI {purchase.participant?.dni}
                    </span>
                  </div>

                  <span className="text-xs text-[#A0A0A8] border border-[#2A2A33] rounded px-2 py-0.5 shrink-0 capitalize">
                    {purchase.payment_method}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#A0A0A8]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      <span
                        className="font-medium text-[#F5F5F0]"
                        style={{ fontFamily: "var(--font-mono-code)" }}
                      >
                        {purchase.total_tickets}
                      </span>
                      <span>tickets</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      <span
                        className="font-medium text-[#C9A961]"
                        style={{ fontFamily: "var(--font-mono-code)" }}
                      >
                        {formatCurrency(purchase.total_amount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateShort(purchase.created_at)}</span>
                  </div>
                </div>

                {receiptUrl && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : purchase.id)}
                    className="flex items-center gap-2 text-xs text-[#C9A961] hover:underline w-fit"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {isExpanded ? "Ocultar" : "Ver"} comprobante
                  </button>
                )}

                <AnimatePresence>
                  {isExpanded && receiptUrl && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <img
                        src={receiptUrl}
                        alt="Comprobante"
                        className="w-full max-h-72 object-contain rounded-md border border-[#2A2A33] bg-[#15151A]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {purchase.payment_status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleAction(purchase.id, "approve")}
                      disabled={isProcessing}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-md py-2.5 border transition-all",
                        "bg-[#0F7B5C]/10 border-[#0F7B5C]/30 hover:bg-[#0F7B5C]/20 text-[#0F7B5C]",
                        "disabled:opacity-50"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleAction(purchase.id, "reject")}
                      disabled={isProcessing}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-md py-2.5 border transition-all",
                        "bg-[#7C2D2D]/10 border-[#7C2D2D]/30 hover:bg-[#7C2D2D]/20 text-[#7C2D2D]",
                        "disabled:opacity-50"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
