import Link from "next/link";
import { Ticket } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1C1F27] bg-[#08090C]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            className="text-base font-bold tracking-widest text-[#EDEFF4] transition-opacity group-hover:opacity-80"
            style={{ fontFamily: "var(--font-display)" }}
          >
            MANIAPREMIOS
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-xs font-medium text-[#8A90A0] hover:text-[#EDEFF4] transition-colors uppercase tracking-wider"
          >
            Sorteos
          </Link>
          <Link
            href="/ganadores"
            className="px-3 py-1.5 text-xs font-medium text-[#8A90A0] hover:text-[#EDEFF4] transition-colors uppercase tracking-wider"
          >
            Ganadores
          </Link>
          <Link
            href="/verificar"
            className="flex items-center gap-1.5 ml-2 px-3 py-1.5 text-xs font-semibold text-[#2E6BFF] border border-[#2E6BFF]/30 rounded-md hover:bg-[#2E6BFF]/10 transition-all uppercase tracking-wider"
          >
            <Ticket className="w-3 h-3" />
            Mis tickets
          </Link>
        </nav>
      </div>
    </header>
  );
}
