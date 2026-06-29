/* ── Promo tiers ── */
export interface PromoTier {
  minTickets: number;
  bonusTickets: number;
  label: string;
  badge: string;
  color: string;
}

export const PROMO_TIERS: PromoTier[] = [
  {
    minTickets: 10,
    bonusTickets: 3,
    label: "Lleva 10, obtén 3 GRATIS",
    badge: "+3 GRATIS",
    color: "#2E6BFF",
  },
  {
    minTickets: 5,
    bonusTickets: 1,
    label: "Lleva 5, obtén 1 GRATIS",
    badge: "+1 GRATIS",
    color: "#2E6BFF",
  },
];

export function calculateBonus(ticketsPaid: number): number {
  for (const tier of PROMO_TIERS) {
    if (ticketsPaid >= tier.minTickets) return tier.bonusTickets;
  }
  return 0;
}

export function getActivePromo(ticketsPaid: number): PromoTier | null {
  return PROMO_TIERS.find((t) => ticketsPaid >= t.minTickets) ?? null;
}

/* ── Quick pick options ── */
export const QUICK_PICKS = [1, 2, 3, 5, 10];

/* ── Default code prefix ── */
export const DEFAULT_CODE_PREFIX = "DTM";

/* ── Ticket code generator ── */
export function generateTicketCode(
  prefix: string,
  ticketNumber: number,
  ticketId: string
): string {
  const paddedNumber = ticketNumber.toString().padStart(4, "0");
  const hash = ticketId.replace(/-/g, "").slice(0, 3).toUpperCase();
  return `${prefix.toUpperCase()}-${paddedNumber}-${hash}`;
}

/* ── FOMO thresholds ── */
export const FOMO_URGENT_THRESHOLD = 30;
export const FOMO_HOT_THRESHOLD = 80;

/* ── Receipt limits ── */
export const MAX_RECEIPT_SIZE = 2 * 1024 * 1024; // 2 MB
export const TARGET_RECEIPT_WIDTH = 1200;
export const TARGET_RECEIPT_QUALITY = 0.75;

/* ── Contact / payment info ── */
export const WHATSAPP_NUMBER = "51966335409"; // formato internacional, sin +
export const WHATSAPP_DISPLAY = "966 335 409";
export const WHATSAPP_DEFAULT_MSG =
  "Hola, tengo una consulta sobre los sorteos de ManiaPremios";
export const YAPE_NAME = "CARLA CARBAJAL";
export const YAPE_NUMBER = "944580823";
