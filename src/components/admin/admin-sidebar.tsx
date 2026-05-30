"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Trophy,
  Tag,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { href: "/admin/sorteos", label: "Sorteos", icon: Tag },
  { href: "/admin/ganadores", label: "Ganadores", icon: Trophy },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  }

  return (
    <aside className="w-56 shrink-0 border-r border-[#2A2A33] bg-[#0B0B0D] flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-[#2A2A33]">
        <span
          className="text-sm font-bold text-[#C9A961] block"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          MANIAPREMIOS
        </span>
        <span className="text-[10px] text-[#A0A0A8] uppercase tracking-widest">
          Panel Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150",
                isActive
                  ? "bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/20"
                  : "text-[#A0A0A8] hover:text-[#F5F5F0] hover:bg-[#1C1C22]"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#2A2A33]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#A0A0A8] hover:text-[#F5F5F0] hover:bg-[#1C1C22] transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
