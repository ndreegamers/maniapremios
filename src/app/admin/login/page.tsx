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
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#08090C]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-md bg-[#2E6BFF]/10 border border-[#2E6BFF]/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#2E6BFF]" />
          </div>
          <div>
            <h1
              className="font-bold text-xl text-[#EDEFF4]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              MANIAPREMIOS
            </h1>
            <p className="text-xs text-[#8A90A0] mt-1">Panel de administración</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-[#1C1F27] bg-[#0F1116] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#8A90A0] uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#262A34]" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#14161C] border border-[#1C1F27] rounded-md px-4 py-3 pl-10 pr-10 text-[#EDEFF4] focus:outline-none focus:border-[#2E6BFF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#262A34] hover:text-[#8A90A0] transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 bg-[#2E6BFF] text-[#08090C] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#4F7FFF] disabled:opacity-50 disabled:cursor-not-allowed"
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
