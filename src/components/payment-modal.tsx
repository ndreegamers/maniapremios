"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, Ticket, CheckCircle2, QrCode, Upload, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReceiptUploader } from "@/components/receipt-uploader";
import { formatCurrency, cn } from "@/lib/utils";
import { YAPE_NAME, YAPE_NUMBER } from "@/lib/constants";
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

interface StepRowProps {
  index: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  state: "done" | "active" | "idle";
}

function StepRow({ index, title, description, icon, state }: StepRowProps) {
  return (
    <div className={cn(
      "flex items-start gap-4 py-3 border-b border-[#1C1F27] last:border-0",
      state === "idle" && "opacity-40"
    )}>
      <span className="index-number pt-0.5 w-6 text-right shrink-0">{index}</span>
      <div className={cn(
        "p-1.5 rounded-md shrink-0 mt-0.5",
        state === "done" ? "text-[#22C55E] bg-[#22C55E]/10" :
        state === "active" ? "text-[#2E6BFF] bg-[#2E6BFF]/10" :
        "text-[#8A90A0] bg-[#1C1F27]"
      )}>
        {state === "done" ? <CheckCircle2 className="w-4 h-4" /> : icon}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-semibold leading-tight",
            state === "active" ? "text-[#EDEFF4]" :
            state === "done" ? "text-[#22C55E]" :
            "text-[#8A90A0]"
          )}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </span>
        {description && (
          <span className="text-xs text-[#8A90A0] leading-relaxed">{description}</span>
        )}
      </div>
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
  const [copiedNumber, setCopiedNumber] = useState(false);

  async function copyNumber() {
    await navigator.clipboard.writeText(YAPE_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  }

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

  // Step states
  const step1State = "done"; // always: user confirmed order before opening modal
  const step2State = receiptFile ? "done" : "active";
  const step3State = receiptFile && !submitting ? "active" : "idle";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !submitting) onClose(); }}>
      <DialogContent className="bg-[#0F1116] border-[#1C1F27] max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-[#EDEFF4] text-base font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Completar pago
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Order summary */}
          <div className="bg-[#14161C] rounded-lg p-4 flex flex-col gap-2 border border-[#1C1F27]">
            <span className="section-label">Tu pedido</span>
            <div className="flex justify-between items-center mt-1">
              <div className="flex items-center gap-1.5 text-[#8A90A0] text-sm">
                <Ticket className="w-3.5 h-3.5" />
                <span>Tickets</span>
              </div>
              <span
                className="font-medium text-[#EDEFF4]"
                style={{ fontFamily: "var(--font-mono-code)" }}
              >
                {ticketsPaid}
                {ticketsBonus > 0 && (
                  <span className="ml-1 text-[#38BDF8]">+{ticketsBonus} gratis</span>
                )}
              </span>
            </div>
            {ticketsBonus > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#8A90A0] text-sm">Total tickets</span>
                <span
                  className="font-bold text-[#2E6BFF]"
                  style={{ fontFamily: "var(--font-mono-code)" }}
                >
                  {totalTickets}
                </span>
              </div>
            )}
            <div className="border-t border-[#1C1F27] pt-2 flex justify-between items-center">
              <span className="text-xs text-[#8A90A0] uppercase tracking-wider">Monto a pagar</span>
              <span
                className="font-bold text-xl text-[#EDEFF4]"
                style={{ fontFamily: "var(--font-mono-code)" }}
              >
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Numbered steps */}
          <div className="bg-[#14161C] rounded-lg border border-[#1C1F27] overflow-hidden">
            {/* Step 01 — Confirm */}
            <div className="px-4">
              <StepRow
                index="01"
                title="Pedido confirmado"
                description={`${ticketCount_display(ticketsPaid, ticketsBonus)} para el sorteo seleccionado`}
                icon={<CheckCircle2 className="w-4 h-4" />}
                state={step1State}
              />
            </div>

            {/* Step 02 — Pay with QR */}
            <div className="px-4">
              <StepRow
                index="02"
                title="Paga con Yape o Plin"
                description={`Escanea el QR y envía exactamente ${formatCurrency(totalAmount)}`}
                icon={<QrCode className="w-4 h-4" />}
                state={step2State}
              />
            </div>

            {/* QR inline */}
            <div className="px-4 pb-4">
              <div className="ml-10 flex flex-col items-start gap-3">
                <div className="bg-white rounded-md p-2.5 border border-[#1C1F27] inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/qr-pago.jpeg"
                    alt="QR de pago ManiaPremios"
                    width={140}
                    height={140}
                    className="rounded"
                  />
                </div>

                {/* Yape account info */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#8A90A0] uppercase tracking-wider">Cuenta Yape</span>
                  <span
                    className="text-sm font-semibold text-[#EDEFF4]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {YAPE_NAME}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm text-[#2E6BFF]"
                      style={{ fontFamily: "var(--font-mono-code)" }}
                    >
                      {YAPE_NUMBER}
                    </span>
                    <button
                      onClick={copyNumber}
                      title="Copiar número"
                      className="p-1 rounded border border-[#1C1F27] text-[#8A90A0] hover:text-[#EDEFF4] hover:border-[#262A34] transition-all"
                    >
                      {copiedNumber ? (
                        <Check className="w-3 h-3 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <span
                  className="font-bold text-2xl text-[#2E6BFF]"
                  style={{ fontFamily: "var(--font-mono-code)" }}
                >
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Step 03 — Upload & send */}
            <div className="px-4">
              <StepRow
                index="03"
                title="Sube tu comprobante y envía"
                description="Adjunta una captura del pago realizado"
                icon={<Upload className="w-4 h-4" />}
                state={step3State}
              />
            </div>

            {/* Receipt uploader */}
            <div className="px-4 pb-4">
              <div className="ml-10">
                <ReceiptUploader
                  onFile={setReceiptFile}
                  onClear={() => setReceiptFile(null)}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={submitting || !receiptFile}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-md py-3 font-semibold text-sm transition-all duration-200 tracking-wide",
              receiptFile && !submitting
                ? "bg-[#2E6BFF] text-[#EDEFF4] hover:bg-[#4F7FFF]"
                : "bg-[#1C1F27] text-[#8A90A0] cursor-not-allowed"
            )}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando comprobante...
              </>
            ) : receiptFile ? (
              <>
                <Send className="w-4 h-4" />
                Enviar comprobante
              </>
            ) : (
              "Adjunta tu comprobante primero"
            )}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ticketCount_display(paid: number, bonus: number): string {
  if (bonus > 0) return `${paid} tickets + ${bonus} de regalo`;
  return `${paid} ticket${paid > 1 ? "s" : ""}`;
}
