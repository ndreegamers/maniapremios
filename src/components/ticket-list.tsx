"use client";

import { motion } from "framer-motion";
import { Ticket, Clock, XCircle } from "lucide-react";
import { VerifyResult, TicketWithRaffle } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface TicketListProps {
  result: VerifyResult;
}

function parseTicketCode(code: string): { prefix: string; number: string; hash: string } {
  const parts = code.split("-");
  if (parts.length >= 3) {
    return { prefix: parts[0], number: parts[1], hash: parts[2] };
  }
  return { prefix: code, number: "", hash: "" };
}

function TicketRow({ ticket, isLast }: { ticket: TicketWithRaffle; isLast: boolean }) {
  const { prefix, number, hash } = parseTicketCode(ticket.ticket_code);
  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-4 ${!isLast ? "border-b border-[#2A2A33]/50" : ""}`}
      style={{ fontFamily: "var(--font-mono-code)" }}
    >
      <Ticket className="w-3.5 h-3.5 text-[#C9A961]/60 shrink-0" />
      <span className="text-[11px] text-[#A0A0A8]/60 w-8 shrink-0">{prefix}</span>
      <span className="font-medium text-sm text-[#C9A961] w-12 shrink-0 tabular-nums">
        {number}
      </span>
      <span className="text-[11px] text-[#A0A0A8] tracking-widest flex-1 tabular-nums">
        {hash}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0F7B5C]" />
        <span className="text-[10px] text-[#0F7B5C] uppercase tracking-wide">OK</span>
      </div>
    </div>
  );
}

function TicketGroup({
  raffleTitle,
  drawDate,
  tickets,
}: {
  raffleTitle: string;
  drawDate?: string;
  tickets: TicketWithRaffle[];
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A33]">
        <div className="flex flex-col gap-0.5">
          <span
            className="text-sm font-bold text-[#F5F5F0] leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {raffleTitle}
          </span>
          {drawDate && (
            <span className="text-[10px] text-[#A0A0A8]">
              Sorteo: {formatDate(drawDate)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-[#C9A961]/10 rounded px-2.5 py-1 border border-[#C9A961]/20">
          <Ticket className="w-3 h-3 text-[#C9A961]" />
          <span
            className="font-medium text-sm text-[#C9A961]"
            style={{ fontFamily: "var(--font-mono-code)" }}
          >
            {tickets.length}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-1.5 bg-[#0B0B0D]/30">
        <span className="w-3.5 shrink-0" />
        <span className="text-[9px] text-[#A0A0A8]/40 uppercase w-8 shrink-0">Serie</span>
        <span className="text-[9px] text-[#A0A0A8]/40 uppercase w-12 shrink-0">Nro.</span>
        <span className="text-[9px] text-[#A0A0A8]/40 uppercase flex-1">Hash</span>
        <span className="text-[9px] text-[#A0A0A8]/40 uppercase shrink-0">Est.</span>
      </div>

      {tickets.map((ticket, idx) => (
        <TicketRow key={ticket.id} ticket={ticket} isLast={idx === tickets.length - 1} />
      ))}
    </div>
  );
}

export function TicketList({ result }: TicketListProps) {
  const { participant, tickets, pending_purchases, rejected_purchases } = result;

  if (!participant) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Ticket className="w-10 h-10 text-[#3D3D48]" />
        <p className="text-[#A0A0A8] text-sm">No encontramos registros con ese DNI.</p>
        <p className="text-xs text-[#A0A0A8]/50">
          Si realizaste una compra reciente, es posible que aún esté en proceso.
        </p>
      </div>
    );
  }

  const groups = tickets.reduce<
    Record<string, { title: string; drawDate?: string; tickets: TicketWithRaffle[] }>
  >((acc, ticket) => {
    const key = ticket.raffle_id;
    if (!acc[key]) {
      acc[key] = {
        title: ticket.raffle?.title ?? "Sorteo",
        drawDate: ticket.raffle?.draw_date,
        tickets: [],
      };
    }
    acc[key].tickets.push(ticket);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Participant greeting */}
      <div className="bg-[#1C1C22] rounded-md px-5 py-4 border border-[#2A2A33]">
        <p className="text-xs text-[#A0A0A8] uppercase tracking-wider mb-1">Participante</p>
        <p
          className="font-bold text-[#F5F5F0] text-lg"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {participant.first_name} {participant.last_name}
        </p>
        <p
          className="text-[#C9A961] tracking-widest text-sm mt-0.5"
          style={{ fontFamily: "var(--font-mono-code)" }}
        >
          DNI {participant.dni}
        </p>
      </div>

      {tickets.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-[#A0A0A8] uppercase tracking-widest px-1">
            Tickets confirmados
          </p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md border border-[#2A2A33] bg-[#15151A] overflow-hidden"
          >
            {Object.entries(groups).map(([key, group], groupIdx) => (
              <div key={key} className={groupIdx > 0 ? "border-t border-[#2A2A33]/60" : ""}>
                <TicketGroup
                  raffleTitle={group.title}
                  drawDate={group.drawDate}
                  tickets={group.tickets}
                />
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        <p className="text-center py-4 text-[#A0A0A8] text-sm">
          Aún no tienes tickets confirmados.
        </p>
      )}

      {pending_purchases > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 bg-[#B8860B]/10 border border-[#B8860B]/30 rounded-md px-4 py-3.5"
        >
          <Clock className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
          <div>
            <p className="text-[#B8860B] font-medium text-sm">
              {pending_purchases} compra{pending_purchases !== 1 ? "s" : ""} pendiente{pending_purchases !== 1 ? "s" : ""}
            </p>
            <p className="text-[#B8860B]/70 text-xs mt-0.5">
              Estamos verificando tu pago. Te asignaremos los tickets pronto.
            </p>
          </div>
        </motion.div>
      )}

      {rejected_purchases > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 bg-[#7C2D2D]/10 border border-[#7C2D2D]/30 rounded-md px-4 py-3.5"
        >
          <XCircle className="w-4 h-4 text-[#7C2D2D] shrink-0 mt-0.5" />
          <div>
            <p className="text-[#7C2D2D] font-medium text-sm">
              {rejected_purchases} pago{rejected_purchases !== 1 ? "s" : ""} rechazado{rejected_purchases !== 1 ? "s" : ""}
            </p>
            <p className="text-[#7C2D2D]/70 text-xs mt-0.5">
              Si crees que es un error, contáctanos.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
