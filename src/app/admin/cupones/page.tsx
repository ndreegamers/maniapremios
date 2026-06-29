"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Tag } from "lucide-react";
import { CouponForm } from "@/components/admin/coupon-form";
import { Coupon } from "@/lib/types";

export default function CuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Tag className="w-5 h-5 text-[#2E6BFF]" />
        <div>
          <h1
            className="text-xl font-bold text-[#EDEFF4]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Cupones
          </h1>
          <p className="text-sm text-[#8A90A0]">
            Genera cupones de un solo uso. El cliente los canjea para obtener 1 ticket
            gratis en cualquier sorteo de pago activo.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#2E6BFF] animate-spin" />
        </div>
      ) : (
        <CouponForm coupons={coupons} onRefresh={fetchCoupons} />
      )}
    </div>
  );
}
