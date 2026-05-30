import { Trophy } from "lucide-react";
import { WinnerPublic } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface WinnerCardProps {
  winner: WinnerPublic;
}

export function WinnerCard({ winner }: WinnerCardProps) {
  const positionLabel =
    winner.position === 1 ? "1.er Premio" :
    winner.position === 2 ? "2.do Premio" :
    winner.position === 3 ? "3.er Premio" :
    `${winner.position}.° Premio`;

  return (
    <article className="relative rounded-lg border border-[#2A2A33] border-t-[#C9A961]/30 bg-gradient-to-b from-[#1C1C22] to-[#15151A] p-5 flex flex-col gap-4">
      {/* Position badge */}
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-[#C9A961]" />
        <span className="text-xs font-medium text-[#C9A961] uppercase tracking-widest">
          {positionLabel}
        </span>
      </div>

      {/* Raffle title */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-[#A0A0A8]">{winner.raffle_title}</p>
        {winner.prize_description && (
          <p
            className="text-base font-bold text-[#F5F5F0] leading-snug"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {winner.prize_description}
          </p>
        )}
      </div>

      {/* Ornamental divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#3D3D48] to-transparent" />

      {/* Winner info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A0A0A8] uppercase tracking-wider">Ganador</span>
          <span className="text-sm font-medium text-[#F5F5F0]">{winner.masked_name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A0A0A8] uppercase tracking-wider">Ticket</span>
          <span
            className="text-sm text-[#C9A961] tracking-widest"
            style={{ fontFamily: "var(--font-mono-code)" }}
          >
            {winner.ticket_code}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A0A0A8] uppercase tracking-wider">Fecha</span>
          <span className="text-xs text-[#A0A0A8]">{formatDate(winner.drawn_at)}</span>
        </div>
      </div>
    </article>
  );
}
