export const dynamic = "force-dynamic";

import { RaffleWithStats } from "@/lib/types";
import { Topbar } from "@/components/nav/topbar";
import { Footer } from "@/components/nav/footer";
import { RaffleShowcase } from "@/components/home/raffle-showcase";

const MOCK_RAFFLES: RaffleWithStats[] = [
  {
    id: "preview-raffle-dtm-001",
    title: "iPhone 16 Pro Max 256GB Natural Titanium",
    description:
      "El smartphone más potente de Apple. Natural Titanium, 256GB. Incluye caja y accesorios originales.",
    image_url:
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90",
    ticket_price: 5.0,
    total_tickets: 500,
    draw_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    code_prefix: "DTM",
    created_at: new Date().toISOString(),
    tickets_sold: 337,
    sold_percentage: 67.4,
    is_free: false,
  },
  {
    id: "preview-raffle-dtm-002",
    title: "MacBook Air M3 15\" Starlight",
    description: "La laptop más delgada de Apple con el chip M3. 8GB RAM, 256GB SSD.",
    image_url:
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-15-starlight-select-202402?wid=800&hei=800&fmt=jpeg&qlt=90",
    ticket_price: 10.0,
    total_tickets: 300,
    draw_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    code_prefix: "DTM",
    created_at: new Date().toISOString(),
    tickets_sold: 120,
    sold_percentage: 40.0,
    is_free: false,
  },
  {
    id: "preview-raffle-dtm-003",
    title: "Sorteo Gratuito — Nintendo Switch 2",
    description: "Participa gratis. Máximo 1 ticket por persona.",
    image_url:
      "https://assets.nintendo.com/image/upload/f_auto/q_auto/ncom/software/switch/70010000068718/7481d61b6b4d47a0e5b7e929a1f06c63b9d98e6bf82a0e0f80eb75e3ef5f7b71.jpg",
    ticket_price: 0,
    total_tickets: 200,
    draw_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    code_prefix: "DTM",
    created_at: new Date().toISOString(),
    tickets_sold: 45,
    sold_percentage: 22.5,
    is_free: true,
  },
];

async function getActiveRaffles(): Promise<RaffleWithStats[]> {
  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "true") {
    return MOCK_RAFFLES;
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const { data: raffles, error } = await supabase
      .from("raffles")
      .select(`*, purchases(total_tickets, payment_status)`)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !raffles) return [];

    return raffles.map((r) => {
      const approved = (r.purchases ?? []).filter(
        (p: { payment_status: string }) => p.payment_status === "approved"
      );
      const ticketsSold = approved.reduce(
        (sum: number, p: { total_tickets: number }) => sum + p.total_tickets,
        0
      );
      const soldPercentage =
        r.total_tickets > 0
          ? Math.min(100, Number(((ticketsSold / r.total_tickets) * 100).toFixed(1)))
          : 0;

      const { purchases: _p, ...raffle } = r;
      return {
        ...raffle,
        is_free: raffle.is_free ?? false,
        tickets_sold: ticketsSold,
        sold_percentage: soldPercentage,
      };
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const raffles = await getActiveRaffles();

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />

      <main className="flex-1">
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-4 mb-10">
            <span className="section-label">Sorteos activos</span>
            <div className="flex-1 h-px bg-[#1C1F27]" />
            {raffles.length > 0 && (
              <span
                className="text-xs text-[#8A90A0] tabular-nums"
                style={{ fontFamily: "var(--font-mono-code)" }}
              >
                {raffles.length} disponibles
              </span>
            )}
          </div>

          {raffles.length === 0 ? (
            <div className="rounded-lg border border-[#1C1F27] bg-[#0F1116] p-16 flex flex-col items-center gap-4 text-center">
              <p className="text-[#8A90A0] text-sm">
                Próximamente nuevos sorteos. ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {raffles.map((raffle, i) => (
                <RaffleShowcase key={raffle.id} raffle={raffle} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
