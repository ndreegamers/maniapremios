"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Ticket, User, CreditCard, CheckCircle2,
  ChevronLeft, ChevronRight, Loader2, Phone, ArrowLeft, Calendar
} from "lucide-react";
import { TicketSelector } from "@/components/ticket-selector";
import { DniInput } from "@/components/dni-input";
import { PaymentModal } from "@/components/payment-modal";
import { calculateBonus } from "@/lib/constants";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { DniLookupResult, RaffleWithStats } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2;

const STEPS = [
  { icon: Ticket, label: "Tickets" },
  { icon: User, label: "Datos" },
  { icon: CreditCard, label: "Pago" },
];

export function ParticiparContent() {
  const searchParams = useSearchParams();
  const raffleId = searchParams.get("raffle");
  const [raffle, setRaffle] = useState<RaffleWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>(0);

  const [ticketCount, setTicketCount] = useState(5);
  const [dniData, setDniData] = useState<DniLookupResult | null>(null);
  const [phone, setPhone] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRaffle() {
      try {
        const res = await fetch("/api/raffles");
        const data = await res.json();
        const raffles: RaffleWithStats[] = data.raffles ?? [];

        if (raffleId) {
          const found = raffles.find((r) => r.id === raffleId);
          setRaffle(found ?? raffles[0] ?? null);
        } else {
          setRaffle(raffles[0] ?? null);
        }
      } catch {
        setRaffle(null);
      } finally {
        setLoading(false);
      }
    }
    fetchRaffle();
  }, [raffleId]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#C9A961] animate-spin" />
      </main>
    );
  }

  if (!raffle) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-[#A0A0A8] mb-4">No hay sorteos activos.</p>
        <Link href="/" className="text-[#C9A961] text-sm hover:underline">
          ← Volver al inicio
        </Link>
      </main>
    );
  }

  if (purchaseId) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-[#0F7B5C]/30 bg-[#1C1C22] p-8 max-w-md w-full flex flex-col items-center gap-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-14 h-14 text-[#0F7B5C]" />
          </motion.div>

          <div>
            <h2
              className="font-bold text-2xl text-[#F5F5F0] mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              ¡Compra enviada!
            </h2>
            <p className="text-[#A0A0A8] text-sm leading-relaxed">
              Tu comprobante fue recibido. Estamos verificando tu pago.
              Te asignaremos tus tickets una vez confirmado.
            </p>
          </div>

          <div className="bg-[#15151A] rounded-md px-6 py-4 border border-[#2A2A33] w-full">
            <p className="text-xs text-[#A0A0A8] uppercase tracking-wider mb-1">Tu DNI</p>
            <p
              className="font-bold text-2xl text-[#C9A961] tracking-widest"
              style={{ fontFamily: "var(--font-mono-code)" }}
            >
              {dniData?.success ? dniData.dni : "—"}
            </p>
            <p className="text-xs text-[#A0A0A8] mt-2">Úsalo para verificar tus tickets</p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href={`/verificar?dni=${dniData?.success ? dniData.dni : ""}`}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A961] text-[#0B0B0D] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#E8D08B]"
            >
              <Ticket className="w-4 h-4" />
              Ver mis tickets
            </Link>
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 border border-[#2A2A33] text-[#A0A0A8] text-sm rounded-md py-2.5 transition-all hover:border-[#3D3D48] hover:text-[#F5F5F0]"
            >
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  const bonus = calculateBonus(ticketCount);
  const totalAmount = ticketCount * raffle.ticket_price;
  const isPhoneValid = /^9\d{8}$/.test(phone);
  const canProceedStep0 = ticketCount > 0;
  const canProceedStep1 = dniData?.success === true && isPhoneValid;

  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#A0A0A8] hover:text-[#F5F5F0] text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i;
            const isDone = step > i;
            return (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300",
                      isActive && "border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961]",
                      isDone && "border-[#0F7B5C] bg-[#0F7B5C]/10 text-[#0F7B5C]",
                      !isActive && !isDone && "border-[#2A2A33] bg-[#15151A] text-[#3D3D48]"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wide",
                      isActive ? "text-[#C9A961]" : isDone ? "text-[#0F7B5C]" : "text-[#3D3D48]"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-px mb-5 transition-all duration-300",
                      step > i ? "bg-[#0F7B5C]/40" : "bg-[#2A2A33]"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Split layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          {/* Left — raffle info */}
          <div className="lg:w-[45%] lg:sticky lg:top-8 flex-shrink-0 flex flex-col gap-4">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#2A2A33]">
              <Image
                src={raffle.image_url}
                alt={raffle.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
              />
            </div>

            <div className="rounded-lg border border-[#2A2A33] bg-[#1C1C22] p-5 flex flex-col gap-3">
              <h2
                className="font-bold text-xl text-[#F5F5F0] leading-tight"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {raffle.title}
              </h2>
              <div className="flex items-center gap-2 text-[#C9A961]">
                <Calendar className="w-4 h-4 shrink-0" />
                <span
                  className="text-sm"
                  style={{ fontFamily: "var(--font-mono-code)" }}
                >
                  {formatDateShort(raffle.draw_date)}
                </span>
              </div>
              {raffle.description && (
                <p className="text-[#A0A0A8] text-sm leading-relaxed pt-2 border-t border-[#2A2A33]">
                  {raffle.description}
                </p>
              )}
            </div>
          </div>

          {/* Right — purchase flow */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded-lg border border-[#2A2A33] bg-[#1C1C22] p-6">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <h2
                        className="font-bold text-[#F5F5F0] text-xl mb-1"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        Elige tus tickets
                      </h2>
                      <p className="text-[#A0A0A8] text-sm">
                        Más tickets, más chances de ganar
                      </p>
                    </div>
                    <TicketSelector
                      ticketPrice={raffle.ticket_price}
                      value={ticketCount}
                      onChange={setTicketCount}
                    />
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <h2
                        className="font-bold text-[#F5F5F0] text-xl mb-1"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        Tus datos
                      </h2>
                      <p className="text-[#A0A0A8] text-sm">
                        Identificamos tus tickets con tu DNI
                      </p>
                    </div>

                    <DniInput
                      onSuccess={(result) => setDniData(result)}
                      onClear={() => setDniData(null)}
                    />

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#A0A0A8] uppercase tracking-widest">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone
                          className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                            phone.length > 0 && !isPhoneValid
                              ? "text-[#7C2D2D]"
                              : isPhoneValid
                              ? "text-[#0F7B5C]"
                              : "text-[#3D3D48]"
                          )}
                        />
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                            setPhone(digits);
                          }}
                          placeholder="9xxxxxxxx"
                          className={cn(
                            "w-full bg-[#15151A] border rounded-md px-4 py-3 pl-10 text-[#F5F5F0] focus:outline-none transition-all",
                            phone.length > 0 && !isPhoneValid
                              ? "border-[#7C2D2D] focus:border-[#7C2D2D]"
                              : isPhoneValid
                              ? "border-[#0F7B5C] focus:border-[#0F7B5C]"
                              : "border-[#2A2A33] focus:border-[#C9A961]"
                          )}
                        />
                      </div>
                      {phone.length > 0 && !isPhoneValid && (
                        <p className="text-xs text-[#7C2D2D]">
                          Número válido de 9 dígitos empezando en 9
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <h2
                        className="font-bold text-[#F5F5F0] text-xl mb-1"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        Confirmar y pagar
                      </h2>
                      <p className="text-[#A0A0A8] text-sm">
                        Revisa tu pedido antes de pagar
                      </p>
                    </div>

                    <div className="bg-[#15151A] rounded-md p-4 border border-[#2A2A33] flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#A0A0A8] text-sm">Participante</span>
                        <span className="text-[#F5F5F0] text-sm font-medium">
                          {dniData?.first_name} {dniData?.last_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#A0A0A8] text-sm">DNI</span>
                        <span
                          className="text-[#C9A961]"
                          style={{ fontFamily: "var(--font-mono-code)" }}
                        >
                          {dniData?.dni}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#A0A0A8] text-sm">Tickets</span>
                        <span className="font-medium text-[#F5F5F0]">
                          {ticketCount}
                          {bonus > 0 && (
                            <span className="ml-1 text-[#C9A961]">+{bonus}</span>
                          )}
                          {" "}= {ticketCount + bonus} total
                        </span>
                      </div>
                      <div className="border-t border-[#2A2A33] pt-3 flex justify-between items-center">
                        <span className="text-xs text-[#A0A0A8] uppercase tracking-wider">Total a pagar</span>
                        <span
                          className="font-bold text-2xl text-[#C9A961]"
                          style={{ fontFamily: "var(--font-mono-code)" }}
                        >
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setPaymentOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-[#C9A961] text-[#0B0B0D] font-semibold text-sm rounded-md py-3.5 transition-all hover:bg-[#E8D08B] active:scale-[0.98]"
                    >
                      <CreditCard className="w-4 h-4" />
                      Ver QR y pagar
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="flex items-center gap-2 border border-[#2A2A33] text-[#A0A0A8] text-sm rounded-md px-5 py-2.5 hover:text-[#F5F5F0] hover:border-[#3D3D48] transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </button>
              )}

              {step < 2 && (
                <button
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 font-semibold text-sm rounded-md py-2.5 transition-all",
                    (step === 0 ? canProceedStep0 : canProceedStep1)
                      ? "bg-[#C9A961] text-[#0B0B0D] hover:bg-[#E8D08B]"
                      : "bg-[#2A2A33] text-[#3D3D48] cursor-not-allowed"
                  )}
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSuccess={(id) => {
          setPaymentOpen(false);
          setPurchaseId(id);
        }}
        raffleId={raffle.id}
        dni={dniData?.dni ?? ""}
        firstName={dniData?.first_name ?? ""}
        lastName={dniData?.last_name ?? ""}
        phone={phone}
        ticketsPaid={ticketCount}
        ticketsBonus={bonus}
        totalAmount={totalAmount}
      />
    </main>
  );
}
