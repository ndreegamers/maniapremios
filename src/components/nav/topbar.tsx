import Link from "next/link";
import { Ticket } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#3D3D48] bg-[#0B0B0D]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            className="text-lg font-bold tracking-wide text-[#C9A961] transition-opacity group-hover:opacity-90"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            MANIAPREMIOS
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-[#A0A0A8] hover:text-[#F5F5F0] transition-colors rounded-md hover:bg-[#15151A]"
          >
            Sorteos
          </Link>
          <Link
            href="/ganadores"
            className="px-3 py-1.5 text-sm text-[#A0A0A8] hover:text-[#F5F5F0] transition-colors rounded-md hover:bg-[#15151A]"
          >
            Ganadores
          </Link>
          <Link
            href="/verificar"
            className="flex items-center gap-1.5 ml-2 px-3 py-1.5 text-sm font-medium text-[#C9A961] border border-[#C9A961]/30 rounded-md hover:bg-[#C9A961]/8 transition-all"
          >
            <Ticket className="w-3.5 h-3.5" />
            Mis tickets
          </Link>
        </nav>
      </div>
    </header>
  );
}
