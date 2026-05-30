"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, ArrowUp, Ticket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReceiptUploader } from "@/components/receipt-uploader";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (purchaseId: string) => void;
  raffleId: string;
  dni: string;
  firstName: string;
  lastName: string;
  phone: string;
  ticketsPaid: number;
  ticketsBonus: number;
  totalAmount: number;
}

function StepDot({ number, active }: { number: number; active?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
          active
            ? "bg-[#C9A961] text-[#0B0B0D]"
            : "bg-[#2A2A33] text-[#A0A0A8]"
        )}
      >
        {number}
      </span>
      <span
        className={cn(
          "text-xs font-medium uppercase tracking-wider",
          active ? "text-[#C9A961]" : "text-[#A0A0A8]"
        )}
      >
        {number === 1 ? "Escanea y paga" : number === 2 ? "Adjunta comprobante" : "Enviar"}
      </span>
    </div>
  );
}

export function PaymentModal({
  open,
  onClose,
  onSuccess,
  raffleId,
  dni,
  firstName,
  lastName,
  phone,
  ticketsPaid,
  ticketsBonus,
  totalAmount,
}: PaymentModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalTickets = ticketsPaid + ticketsBonus;

  async function handleSubmit() {
    if (!receiptFile) {
      toast.error("Debes subir tu comprobante de pago");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("raffle_id", raffleId);
      formData.append("dni", dni);
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      if (phone) formData.append("phone", phone);
      formData.append("tickets_paid", ticketsPaid.toString());
      formData.append("payment_method", "yape");
      formData.append("receipt", receiptFile);

      const res = await fetch("/api/tickets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Error al procesar tu compra");
        return;
      }

      onSuccess(data.purchase_id);
    } catch {
      toast.error("Error de conexión. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !submitting) onClose(); }}>
      <DialogContent className="bg-[#1C1C22] border-[#3D3D48] max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-[#F5F5F0] text-lg"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Realizar pago
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Order summary */}
          <div className="bg-[#15151A] rounded-md p-4 flex flex-col gap-2 border border-[#2A2A33]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-[#A0A0A8] text-sm">
                <Ticket className="w-3.5 h-3.5" />
                <span>Tickets</span>
              </div>
              <span
                className="font-medium text-[#F5F5F0]"
                style={{ fontFamily: "var(--font-mono-code)" }}
              >
                {ticketsPaid}
                {ticketsBonus > 0 && (
                  <span className="ml-1 text-[#C9A961]">+{ticketsBonus} gratis</span>
                )}
              </span>
            </div>
            {ticketsBonus > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#A0A0A8] text-sm">Total tickets</span>
                <span
                  className="font-bold text-[#C9A961]"
                  style={{ fontFamily: "var(--font-mono-code)" }}
                >
                  {totalTickets}
                </span>
              </div>
            )}
            <div className="border-t border-[#2A2A33] pt-2 flex justify-between items-center">
              <span className="text-sm text-[#A0A0A8] uppercase tracking-wider">Monto a pagar</span>
              <span
                className="font-bold text-xl text-[#C9A961]"
                style={{ fontFamily: "var(--font-mono-code)" }}
              >
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Step 1 — QR */}
          <div>
            <StepDot number={1} />
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-[#A0A0A8] uppercase tracking-wider text-center">
                Escanea el QR y paga exactamente
              </p>
              <div className="bg-white rounded-md p-3 border border-[#3D3D48]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/qr-yape-placeholder.svg"
                  alt="QR de pago ManiaPremios — reemplazar con QR real"
                  width={180}
                  height={180}
                  className="rounded"
                />
              </div>
              <div
                className="font-bold text-2xl text-[#C9A961]"
                style={{ fontFamily: "var(--font-mono-code)" }}
              >
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-xs text-[#A0A0A8] text-center">
                Envía exactamente este monto por Yape
              </p>
            </div>
          </div>

          {/* Step 2 — Receipt */}
          <div>
            <StepDot number={2} active={!receiptFile} />
            <ReceiptUploader
              onFile={setReceiptFile}
              onClear={() => setReceiptFile(null)}
            />
          </div>

          {/* Step 3 — Submit */}
          <div>
            <StepDot number={3} active={!!receiptFile && !submitting} />
            <motion.button
              onClick={handleSubmit}
              disabled={submitting || !receiptFile}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-md py-3 font-semibold text-sm transition-all duration-200",
                receiptFile && !submitting
                  ? "bg-[#C9A961] text-[#0B0B0D] hover:bg-[#E8D08B]"
                  : "bg-[#2A2A33] text-[#A0A0A8] cursor-not-allowed"
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : receiptFile ? (
                <>
                  <Send className="w-4 h-4" />
                  Enviar comprobante
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4" />
                  Adjunta tu comprobante primero
                </>
              )}
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
