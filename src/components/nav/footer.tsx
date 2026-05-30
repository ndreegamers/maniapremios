import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2A2A33] bg-[#0B0B0D] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span
              className="text-base font-bold text-[#C9A961]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              MANIAPREMIOS
            </span>
            <p className="text-xs text-[#A0A0A8] leading-relaxed max-w-[180px]">
              Premios extraordinarios. Mecánica totalmente transparente.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#A0A0A8] uppercase tracking-wider mb-1">
              Participar
            </span>
            <Link href="/" className="text-sm text-[#A0A0A8] hover:text-[#F5F5F0] transition-colors">
              Sorteos activos
            </Link>
            <Link href="/verificar" className="text-sm text-[#A0A0A8] hover:text-[#F5F5F0] transition-colors">
              Verificar mis tickets
            </Link>
            <Link href="/ganadores" className="text-sm text-[#A0A0A8] hover:text-[#F5F5F0] transition-colors">
              Ganadores
            </Link>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#A0A0A8] uppercase tracking-wider mb-1">
              Información
            </span>
            <span className="text-sm text-[#A0A0A8]">Pago vía Yape</span>
            <span className="text-sm text-[#A0A0A8]">Verificación manual</span>
            <span className="text-sm text-[#A0A0A8]">Solo Perú</span>
          </div>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3D3D48] to-transparent" />
          <span className="text-[#3D3D48] text-xs select-none">◆</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3D3D48] to-transparent" />
        </div>

        <p className="text-center text-xs text-[#A0A0A8]/50">
          © {year} ManiaPremios · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
