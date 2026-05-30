"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Trophy,
  Tag,
  LogOut,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { href: "/admin/sorteos", label: "Sorteos", icon: Tag },
  { href: "/admin/ganadores", label: "Ganadores", icon: Trophy },
  { href: "/admin/referidos", label: "Referidos", icon: Share2 },
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
    <aside className="w-52 shrink-0 border-r border-[#1C1F27] bg-[#08090C] flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#1C1F27]">
        <span
          className="text-sm font-bold text-[#EDEFF4] tracking-widest block"
          style={{ fontFamily: "var(--font-display)" }}
        >
          MANIAPREMIOS
        </span>
        <span className="section-label mt-1">Panel Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 font-medium",
                isActive
                  ? "bg-[#2E6BFF]/10 text-[#2E6BFF] border border-[#2E6BFF]/20"
                  : "text-[#8A90A0] hover:text-[#EDEFF4] hover:bg-[#0F1116] border border-transparent"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#1C1F27]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#8A90A0] hover:text-[#EDEFF4] hover:bg-[#0F1116] transition-all duration-150 border border-transparent"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
