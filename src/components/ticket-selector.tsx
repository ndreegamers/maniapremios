"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Star, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUICK_PICKS, PROMO_TIERS, calculateBonus, getActivePromo } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface TicketSelectorProps {
  ticketPrice: number;
  value: number;
  onChange: (value: number) => void;
}

export function TicketSelector({ ticketPrice, value, onChange }: TicketSelectorProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const bonus = calculateBonus(value);
  const activePromo = getActivePromo(value);
  const total = value + bonus;
  const totalAmount = value * ticketPrice;

  function handleQuickPick(qty: number) {
    setCustomMode(false);
    onChange(qty);
  }

  function handleCustomChange(val: string) {
    setCustomInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) onChange(num);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Promo tiers */}
      <div className="grid grid-cols-2 gap-3">
        {PROMO_TIERS.map((tier) => {
          const isActive = activePromo?.minTickets === tier.minTickets;
          return (
            <motion.button
              key={tier.minTickets}
              onClick={() => handleQuickPick(tier.minTickets)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-md p-4 min-h-[100px] border transition-all duration-200",
                isActive
                  ? "border-[#2E6BFF]/60 bg-[#2E6BFF]/10"
                  : "border-[#1C1F27] bg-[#14161C] hover:border-[#2E6BFF]/30"
              )}
            >
              <Star
                className="w-5 h-5 transition-colors duration-200"
                style={{ color: isActive ? "#2E6BFF" : "#262A34" }}
                fill={isActive ? "#2E6BFF" : "none"}
              />
              <span
                className={cn(
                  "text-xs text-center leading-snug",
                  isActive ? "text-[#EDEFF4]" : "text-[#8A90A0]"
                )}
              >
                {tier.label}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-sm",
                  isActive
                    ? "bg-[#2E6BFF] text-[#08090C]"
                    : "bg-[#1C1F27] text-[#8A90A0]"
                )}
              >
                {tier.badge}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Quick picks */}
      <div>
        <p className="text-xs font-medium text-[#8A90A0] uppercase tracking-widest mb-3">
          Seleccionar cantidad
        </p>
        <div className="grid grid-cols-5 gap-2">
          {QUICK_PICKS.map((qty) => {
            const qBonus = calculateBonus(qty);
            const isSelected = value === qty && !customMode;
            return (
              <motion.button
                key={qty}
                onClick={() => handleQuickPick(qty)}
                whileTap={{ scale: 0.93 }}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-md py-3 border transition-all duration-200",
                  isSelected
                    ? "border-[#2E6BFF] bg-[#2E6BFF]/10"
                    : "border-[#1C1F27] bg-[#14161C] hover:border-[#2E6BFF]/40"
                )}
              >
                <span
                  className={cn(
                    "font-bold text-xl leading-none",
                    isSelected ? "text-[#2E6BFF]" : "text-[#EDEFF4]"
                  )}
                >
                  {qty}
                </span>
                <span className="text-[10px] text-[#8A90A0] mt-0.5">
                  {qty === 1 ? "ticket" : "tickets"}
                </span>
                {qBonus > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#2E6BFF] text-[#08090C] text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-tight">
                    +{qBonus}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom quantity */}
      <div>
        <button
          onClick={() => { setCustomMode(true); setCustomInput(value.toString()); }}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-md py-2.5 border text-sm font-medium transition-all duration-200",
            customMode
              ? "border-[#2E6BFF]/60 bg-[#2E6BFF]/10 text-[#2E6BFF]"
              : "border-[#1C1F27] text-[#8A90A0] hover:border-[#2E6BFF]/40 hover:text-[#EDEFF4]"
          )}
        >
          <Pencil className="w-3.5 h-3.5" />
          Cantidad personalizada
        </button>
        <AnimatePresence>
          {customMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input
                type="number"
                min={1}
                value={customInput}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Ej: 15"
                autoFocus
                className="mt-2 w-full bg-[#14161C] border border-[#2E6BFF]/30 rounded-md px-4 py-3 text-[#EDEFF4] font-bold text-center text-2xl focus:outline-none focus:border-[#2E6BFF] transition-all"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <AnimatePresence>
        {value > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-md border border-[#1C1F27] bg-[#14161C] p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#8A90A0] text-sm">
                <Ticket className="w-3.5 h-3.5" />
                <span>
                  {value} ticket{value !== 1 ? "s" : ""} × {formatCurrency(ticketPrice)}
                </span>
              </div>
              <span className="font-medium text-[#EDEFF4]">{formatCurrency(totalAmount)}</span>
            </div>

            {bonus > 0 && (
              <div className="flex items-center justify-between text-[#2E6BFF]">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-3.5 h-3.5" />
                  <span>Bonus promo &quot;{activePromo?.badge}&quot;</span>
                </div>
                <span className="font-medium">+{bonus} gratis</span>
              </div>
            )}

            <div className="border-t border-[#1C1F27] pt-3 flex items-center justify-between">
              <span className="text-xs font-medium text-[#8A90A0] uppercase tracking-wide">
                Total tickets
              </span>
              <span
                className="font-bold text-2xl text-[#2E6BFF]"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                {total}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8A90A0] uppercase tracking-wide">
                A pagar
              </span>
              <span
                className="font-bold text-2xl text-[#EDEFF4]"
                style={{ fontFamily: "var(--font-mono-code)" }}
              >
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
