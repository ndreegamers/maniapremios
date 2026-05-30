"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Ticket, User, CreditCard, CheckCircle2,
  ChevronLeft, ChevronRight, Loader2, Phone, ArrowLeft, Calendar, Gift, Share2
} from "lucide-react";
import { TicketSelector } from "@/components/ticket-selector";
import { DniInput } from "@/components/dni-input";
import { PaymentModal } from "@/components/payment-modal";
import { calculateBonus } from "@/lib/constants";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { DniLookupResult, RaffleWithStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Step = 0 | 1 | 2;

// Steps for paid raffles
const PAID_STEPS = [
  { icon: Ticket, label: "Tickets", num: "01" },
  { icon: User, label: "Datos", num: "02" },
  { icon: CreditCard, label: "Pago", num: "03" },
];

// Steps for free raffles (no ticket selector, no payment)
const FREE_STEPS = [
  { icon: User, label: "Datos", num: "01" },
  { icon: Gift, label: "Confirmar", num: "02" },
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
  const [referralCode, setReferralCode] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [freeTicketCode, setFreeTicketCode] = useState<string | null>(null);
  const [submittingFree, setSubmittingFree] = useState(false);

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
        <Loader2 className="w-6 h-6 text-[#2E6BFF] animate-spin" />
      </main>
    );
  }

  if (!raffle) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-[#8A90A0] mb-4">No hay sorteos activos.</p>
        <Link href="/" className="text-[#2E6BFF] text-sm hover:underline">
          ← Volver al inicio
        </Link>
      </main>
    );
  }

  // ── Success screens ──────────────────────────────────────────────────────

  if (freeTicketCode) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-[#2E6BFF]/20 bg-[#0F1116] p-8 max-w-md w-full flex flex-col items-center gap-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-14 h-14 text-[#2E6BFF]" />
          </motion.div>

          <div>
            <h2 className="font-bold text-2xl text-[#EDEFF4] mb-2" style={{ fontFamily: "var(--font-display)" }}>
              ¡Inscripción confirmada!
            </h2>
            <p className="text-[#8A90A0] text-sm leading-relaxed">
              Tu ticket gratuito ha sido generado. ¡Buena suerte!
            </p>
          </div>

          <div className="bg-[#14161C] rounded-md px-6 py-4 border border-[#1C1F27] w-full">
            <p className="section-label mb-2">Tu ticket</p>
            <p
              className="font-bold text-xl text-[#2E6BFF] tracking-widest"
              style={{ fontFamily: "var(--font-mono-code)" }}
            >
              {freeTicketCode}
            </p>
          </div>

          <div className="bg-[#14161C] rounded-md px-6 py-4 border border-[#1C1F27] w-full">
            <p className="section-label mb-2">Tu DNI</p>
            <p
              className="font-bold text-xl text-[#EDEFF4] tracking-widest"
              style={{ fontFamily: "var(--font-mono-code)" }}
            >
              {dniData?.success ? dniData.dni : "—"}
            </p>
            <p className="text-xs text-[#8A90A0] mt-2">Úsalo para verificar tus tickets</p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href={`/verificar?dni=${dniData?.success ? dniData.dni : ""}`}
              className="w-full flex items-center justify-center gap-2 bg-[#2E6BFF] text-[#EDEFF4] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#4F7FFF] tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Ticket className="w-4 h-4" />
              Ver mis tickets
            </Link>
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 border border-[#1C1F27] text-[#8A90A0] text-sm rounded-md py-2.5 transition-all hover:border-[#262A34] hover:text-[#EDEFF4]"
            >
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  if (purchaseId) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-[#2E6BFF]/20 bg-[#0F1116] p-8 max-w-md w-full flex flex-col items-center gap-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-14 h-14 text-[#2E6BFF]" />
          </motion.div>

          <div>
            <h2 className="font-bold text-2xl text-[#EDEFF4] mb-2" style={{ fontFamily: "var(--font-display)" }}>
              ¡Compra enviada!
            </h2>
            <p className="text-[#8A90A0] text-sm leading-relaxed">
              Tu comprobante fue recibido. Estamos verificando tu pago.
              Te asignaremos tus tickets una vez confirmado.
            </p>
          </div>

          <div className="bg-[#14161C] rounded-md px-6 py-4 border border-[#1C1F27] w-full">
            <p className="section-label mb-2">Tu DNI</p>
            <p
              className="font-bold text-2xl text-[#EDEFF4] tracking-widest"
              style={{ fontFamily: "var(--font-mono-code)" }}
            >
              {dniData?.success ? dniData.dni : "—"}
            </p>
            <p className="text-xs text-[#8A90A0] mt-2">Úsalo para verificar tus tickets</p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href={`/verificar?dni=${dniData?.success ? dniData.dni : ""}`}
              className="w-full flex items-center justify-center gap-2 bg-[#2E6BFF] text-[#EDEFF4] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#4F7FFF] tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Ticket className="w-4 h-4" />
              Ver mis tickets
            </Link>
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 border border-[#1C1F27] text-[#8A90A0] text-sm rounded-md py-2.5 transition-all hover:border-[#262A34] hover:text-[#EDEFF4]"
            >
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // ── State computations ────────────────────────────────────────────────────

  const isFree = raffle.is_free;
  const STEPS = isFree ? FREE_STEPS : PAID_STEPS;

  const bonus = isFree ? 0 : calculateBonus(ticketCount);
  const totalAmount = isFree ? 0 : ticketCount * raffle.ticket_price;
  const isPhoneValid = /^9\d{8}$/.test(phone);

  // For free raffles: step 0 = datos (DNI + phone + referral), step 1 = confirm
  // For paid raffles: step 0 = tickets, step 1 = datos, step 2 = pago
  const canProceedStep0 = isFree
    ? (dniData?.success === true && isPhoneValid)
    : ticketCount > 0;
  const canProceedStep1 = isFree
    ? true // confirm is always enabled at this point
    : (dniData?.success === true && isPhoneValid);

  // ── Free raffle submit ────────────────────────────────────────────────────

  async function handleFreeSubmit() {
    if (!dniData?.success) return;
    setSubmittingFree(true);
    try {
      const res = await fetch("/api/free-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffle_id: raffle!.id,
          dni: dniData.dni,
          first_name: dniData.first_name,
          last_name: dniData.last_name,
          phone,
          referral_code: referralCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al inscribirse");
        return;
      }
      setFreeTicketCode(data.ticket_code);
    } catch {
      toast.error("Error de conexión. Intenta nuevamente.");
    } finally {
      setSubmittingFree(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#8A90A0] hover:text-[#EDEFF4] text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Free badge */}
        {isFree && (
          <div className="flex items-center gap-2 bg-[#2E6BFF]/10 border border-[#2E6BFF]/20 rounded-md px-4 py-2.5 w-fit">
            <Gift className="w-4 h-4 text-[#2E6BFF]" />
            <span className="text-sm font-semibold text-[#2E6BFF]" style={{ fontFamily: "var(--font-display)" }}>
              Sorteo gratuito — 1 ticket por persona
            </span>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i;
            const isDone = step > i;
            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-300",
                    isActive && "border-[#2E6BFF]/40 bg-[#2E6BFF]/10 text-[#2E6BFF]",
                    isDone && "border-[#1C1F27] bg-[#14161C] text-[#22C55E]",
                    !isActive && !isDone && "border-transparent text-[#8A90A0]/40"
                  )}>
                    <span className="index-number text-[10px]" style={{ opacity: 1 }}>{s.num}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    <span className={cn(
                      "text-[10px] font-medium uppercase tracking-wider hidden sm:block",
                      isActive ? "text-[#2E6BFF]" : isDone ? "text-[#22C55E]" : "text-[#8A90A0]/40"
                    )}>
                      {s.label}
                    </span>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-px mx-2 transition-all duration-300",
                    step > i ? "bg-[#2E6BFF]/30" : "bg-[#1C1F27]"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Split layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          {/* Left — raffle info */}
          <div className="lg:w-[42%] lg:sticky lg:top-8 flex-shrink-0 flex flex-col gap-4">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#1C1F27]">
              <Image
                src={raffle.image_url}
                alt={raffle.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority
              />
            </div>

            <div className="rounded-lg border border-[#1C1F27] bg-[#0F1116] p-5 flex flex-col gap-3">
              <h2
                className="font-bold text-lg text-[#EDEFF4] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {raffle.title}
              </h2>
              <div className="flex items-center gap-2 text-[#2E6BFF]">
                <Calendar className="w-4 h-4 shrink-0" />
                <span
                  className="text-sm"
                  style={{ fontFamily: "var(--font-mono-code)" }}
                >
                  {formatDateShort(raffle.draw_date)}
                </span>
              </div>
              {raffle.description && (
                <p className="text-[#8A90A0] text-sm leading-relaxed pt-2 border-t border-[#1C1F27]">
                  {raffle.description}
                </p>
              )}
            </div>
          </div>

          {/* Right — purchase flow */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded-lg border border-[#1C1F27] bg-[#0F1116] p-6">
              <AnimatePresence mode="wait">

                {/* ── FREE RAFFLE STEPS ─────────────────────────────── */}

                {isFree && step === 0 && (
                  <motion.div
                    key="free-step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <h2
                        className="font-bold text-[#EDEFF4] text-xl mb-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Tus datos
                      </h2>
                      <p className="text-[#8A90A0] text-sm">
                        Ingresa tu DNI para identificar tu ticket
                      </p>
                    </div>

                    <DniInput
                      onSuccess={(result) => setDniData(result)}
                      onClear={() => setDniData(null)}
                    />

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#8A90A0] uppercase tracking-widest">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone
                          className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                            phone.length > 0 && !isPhoneValid
                              ? "text-[#7C2D2D]"
                              : isPhoneValid
                              ? "text-[#22C55E]"
                              : "text-[#262A34]"
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
                            "w-full bg-[#14161C] border rounded-md px-4 py-3 pl-10 text-[#EDEFF4] focus:outline-none transition-all placeholder:text-[#262A34]",
                            phone.length > 0 && !isPhoneValid
                              ? "border-[#7C2D2D] focus:border-[#7C2D2D]"
                              : isPhoneValid
                              ? "border-[#22C55E]/40 focus:border-[#22C55E]"
                              : "border-[#1C1F27] focus:border-[#2E6BFF]"
                          )}
                        />
                      </div>
                    </div>

                    {/* Referral code */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#8A90A0] uppercase tracking-widest flex items-center gap-2">
                        <Share2 className="w-3 h-3" />
                        Código de referido <span className="text-[#262A34] normal-case tracking-normal">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="ej. ANGEL92"
                        className="w-full bg-[#14161C] border border-[#1C1F27] rounded-md px-4 py-3 text-[#EDEFF4] focus:outline-none focus:border-[#2E6BFF] transition-all placeholder:text-[#262A34] uppercase"
                        style={{ fontFamily: "var(--font-mono-code)" }}
                      />
                      <p className="text-[10px] text-[#8A90A0]/60">
                        Si alguien te invitó, ingresa su código y recibe un ticket de bienvenida
                      </p>
                    </div>
                  </motion.div>
                )}

                {isFree && step === 1 && (
                  <motion.div
                    key="free-step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <h2
                        className="font-bold text-[#EDEFF4] text-xl mb-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Confirmar inscripción
                      </h2>
                      <p className="text-[#8A90A0] text-sm">
                        Revisa tus datos antes de confirmar
                      </p>
                    </div>

                    <div className="bg-[#14161C] rounded-md p-4 border border-[#1C1F27] flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8A90A0] text-sm">Participante</span>
                        <span className="text-[#EDEFF4] text-sm font-medium">
                          {dniData?.first_name} {dniData?.last_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8A90A0] text-sm">DNI</span>
                        <span
                          className="text-[#2E6BFF]"
                          style={{ fontFamily: "var(--font-mono-code)" }}
                        >
                          {dniData?.dni}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8A90A0] text-sm">Sorteo</span>
                        <span className="text-[#EDEFF4] text-sm font-medium line-clamp-1 max-w-[180px] text-right">
                          {raffle.title}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8A90A0] text-sm">Tickets</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#EDEFF4] font-medium">1</span>
                          <span className="text-xs text-[#2E6BFF] bg-[#2E6BFF]/10 border border-[#2E6BFF]/20 rounded px-1.5 py-0.5 font-semibold">GRATIS</span>
                        </div>
                      </div>
                      {referralCode.trim() && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#8A90A0] text-sm">Código de referido</span>
                          <span
                            className="text-[#38BDF8] text-sm"
                            style={{ fontFamily: "var(--font-mono-code)" }}
                          >
                            {referralCode.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleFreeSubmit}
                      disabled={submittingFree}
                      className="w-full flex items-center justify-center gap-2 bg-[#2E6BFF] text-[#EDEFF4] font-semibold text-sm rounded-md py-3.5 transition-all hover:bg-[#4F7FFF] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed tracking-wide"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {submittingFree ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          Confirmar inscripción gratuita
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* ── PAID RAFFLE STEPS ─────────────────────────────── */}

                {!isFree && step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <h2
                        className="font-bold text-[#EDEFF4] text-xl mb-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Elige tus tickets
                      </h2>
                      <p className="text-[#8A90A0] text-sm">
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

                {!isFree && step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <h2
                        className="font-bold text-[#EDEFF4] text-xl mb-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Tus datos
                      </h2>
                      <p className="text-[#8A90A0] text-sm">
                        Identificamos tus tickets con tu DNI
                      </p>
                    </div>

                    <DniInput
                      onSuccess={(result) => setDniData(result)}
                      onClear={() => setDniData(null)}
                    />

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#8A90A0] uppercase tracking-widest">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone
                          className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                            phone.length > 0 && !isPhoneValid
                              ? "text-[#7C2D2D]"
                              : isPhoneValid
                              ? "text-[#22C55E]"
                              : "text-[#262A34]"
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
                            "w-full bg-[#14161C] border rounded-md px-4 py-3 pl-10 text-[#EDEFF4] focus:outline-none transition-all placeholder:text-[#262A34]",
                            phone.length > 0 && !isPhoneValid
                              ? "border-[#7C2D2D] focus:border-[#7C2D2D]"
                              : isPhoneValid
                              ? "border-[#22C55E]/40 focus:border-[#22C55E]"
                              : "border-[#1C1F27] focus:border-[#2E6BFF]"
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

                {!isFree && step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <h2
                        className="font-bold text-[#EDEFF4] text-xl mb-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Confirmar y pagar
                      </h2>
                      <p className="text-[#8A90A0] text-sm">
                        Revisa tu pedido antes de pagar
                      </p>
                    </div>

                    <div className="bg-[#14161C] rounded-md p-4 border border-[#1C1F27] flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8A90A0] text-sm">Participante</span>
                        <span className="text-[#EDEFF4] text-sm font-medium">
                          {dniData?.first_name} {dniData?.last_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8A90A0] text-sm">DNI</span>
                        <span
                          className="text-[#2E6BFF]"
                          style={{ fontFamily: "var(--font-mono-code)" }}
                        >
                          {dniData?.dni}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8A90A0] text-sm">Tickets</span>
                        <span className="font-medium text-[#EDEFF4]">
                          {ticketCount}
                          {bonus > 0 && (
                            <span className="ml-1 text-[#38BDF8]">+{bonus}</span>
                          )}
                          {" "}= {ticketCount + bonus} total
                        </span>
                      </div>
                      <div className="border-t border-[#1C1F27] pt-3 flex justify-between items-center">
                        <span className="text-xs text-[#8A90A0] uppercase tracking-wider">Total a pagar</span>
                        <span
                          className="font-bold text-2xl text-[#EDEFF4]"
                          style={{ fontFamily: "var(--font-mono-code)" }}
                        >
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setPaymentOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-[#2E6BFF] text-[#EDEFF4] font-semibold text-sm rounded-md py-3.5 transition-all hover:bg-[#4F7FFF] active:scale-[0.98] tracking-wide"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      <CreditCard className="w-4 h-4" />
                      Ver QR y pagar
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation — not shown on free confirm step (has its own submit) */}
            {!(isFree && step === 1) && (
              <div className="flex gap-3">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => (s - 1) as Step)}
                    className="flex items-center gap-2 border border-[#1C1F27] text-[#8A90A0] text-sm rounded-md px-5 py-2.5 hover:text-[#EDEFF4] hover:border-[#262A34] transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Atrás
                  </button>
                )}

                {step < STEPS.length - 1 && (
                  <button
                    onClick={() => setStep((s) => (s + 1) as Step)}
                    disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 font-semibold text-sm rounded-md py-2.5 transition-all tracking-wide",
                      (step === 0 ? canProceedStep0 : canProceedStep1)
                        ? "bg-[#2E6BFF] text-[#EDEFF4] hover:bg-[#4F7FFF]"
                        : "bg-[#1C1F27] text-[#262A34] cursor-not-allowed"
                    )}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!isFree && (
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
      )}
    </main>
  );
}
