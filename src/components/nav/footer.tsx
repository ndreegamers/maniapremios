import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1C1F27] bg-[#08090C] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span
              className="text-sm font-bold text-[#EDEFF4] tracking-widest"
              style={{ fontFamily: "var(--font-display)" }}
            >
              MANIAPREMIOS
            </span>
            <p className="text-xs text-[#8A90A0] leading-relaxed max-w-[180px]">
              Sorteos con verificación totalmente transparente.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <span className="section-label mb-2">Participar</span>
            <Link href="/" className="text-sm text-[#8A90A0] hover:text-[#EDEFF4] transition-colors">
              Sorteos activos
            </Link>
            <Link href="/verificar" className="text-sm text-[#8A90A0] hover:text-[#EDEFF4] transition-colors">
              Verificar mis tickets
            </Link>
            <Link href="/ganadores" className="text-sm text-[#8A90A0] hover:text-[#EDEFF4] transition-colors">
              Ganadores
            </Link>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2">
            <span className="section-label mb-2">Info</span>
            <span className="text-sm text-[#8A90A0]">Pago vía Yape</span>
            <span className="text-sm text-[#8A90A0]">Verificación manual</span>
            <span className="text-sm text-[#8A90A0]">Solo Perú</span>
          </div>
        </div>

        <div className="h-px bg-[#1C1F27] mb-6" />

        <p className="text-center text-xs text-[#8A90A0]/50">
          © {year} ManiaPremios · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
