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
    <article className="relative rounded-lg border border-[#1C1F27] border-t-[#2E6BFF]/30 bg-gradient-to-b from-[#0F1116] to-[#14161C] p-5 flex flex-col gap-4">
      {/* Position badge */}
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-[#2E6BFF]" />
        <span className="text-xs font-medium text-[#2E6BFF] uppercase tracking-widest">
          {positionLabel}
        </span>
      </div>

      {/* Raffle title */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-[#8A90A0]">{winner.raffle_title}</p>
        {winner.prize_description && (
          <p
            className="text-base font-bold text-[#EDEFF4] leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {winner.prize_description}
          </p>
        )}
      </div>

      {/* Ornamental divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#1C1F27] to-transparent" />

      {/* Winner info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8A90A0] uppercase tracking-wider">Ganador</span>
          <span className="text-sm font-medium text-[#EDEFF4]">{winner.masked_name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8A90A0] uppercase tracking-wider">Ticket</span>
          <span
            className="text-sm text-[#2E6BFF] tracking-widest"
            style={{ fontFamily: "var(--font-mono-code)" }}
          >
            {winner.ticket_code}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8A90A0] uppercase tracking-wider">Fecha</span>
          <span className="text-xs text-[#8A90A0]">{formatDate(winner.drawn_at)}</span>
        </div>
      </div>
    </article>
  );
}
