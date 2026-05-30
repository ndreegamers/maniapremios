"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Share2 } from "lucide-react";
import { ReferralForm } from "@/components/admin/referral-form";

interface ReferralCode {
  id: string;
  code: string;
  created_at: string;
  participant: {
    id: string;
    dni: string;
    first_name: string;
    last_name: string;
  } | null;
  uses_count: number;
}

export default function ReferidosPage() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/referrals");
      const data = await res.json();
      setCodes(data.codes ?? []);
    } catch {
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Share2 className="w-5 h-5 text-[#2E6BFF]" />
        <div>
          <h1
            className="text-xl font-bold text-[#EDEFF4]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Referidos
          </h1>
          <p className="text-sm text-[#8A90A0]">
            Asigna códigos de referido a usuarios registrados. Cada código genera +1 ticket al referrer en sorteos gratuitos (máx. 5 por sorteo).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#2E6BFF] animate-spin" />
        </div>
      ) : (
        <ReferralForm codes={codes} onRefresh={fetchCodes} />
      )}
    </div>
  );
}
