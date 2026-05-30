"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        toast.error("Contraseña incorrecta");
        setPassword("");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#0B0B0D]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-md bg-[#C9A961]/10 border border-[#C9A961]/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#C9A961]" />
          </div>
          <div>
            <h1
              className="font-bold text-xl text-[#F5F5F0]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              MANIAPREMIOS
            </h1>
            <p className="text-xs text-[#A0A0A8] mt-1">Panel de administración</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-[#2A2A33] bg-[#1C1C22] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#A0A0A8] uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D3D48]" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#15151A] border border-[#2A2A33] rounded-md px-4 py-3 pl-10 pr-10 text-[#F5F5F0] focus:outline-none focus:border-[#C9A961] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D3D48] hover:text-[#A0A0A8] transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A961] text-[#0B0B0D] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#E8D08B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
