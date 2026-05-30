export const dynamic = "force-dynamic";

import { RaffleWithStats } from "@/lib/types";
import { Topbar } from "@/components/nav/topbar";
import { Footer } from "@/components/nav/footer";
import { EditorialHero } from "@/components/home/editorial-hero";
import { RaffleShowcase } from "@/components/home/raffle-showcase";
import { OrnamentalDivider } from "@/components/nav/ornamental-divider";

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
      return { ...raffle, tickets_sold: ticketsSold, sold_percentage: soldPercentage };
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const raffles = await getActiveRaffles();
  const [featuredRaffle, ...secondaryRaffles] = raffles;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />

      <main className="flex-1">
        {/* Editorial hero */}
        <EditorialHero featuredRaffle={featuredRaffle ?? null} />

        {/* Secondary raffles grid */}
        {secondaryRaffles.length > 0 && (
          <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16">
            <OrnamentalDivider className="mb-10" label="Más sorteos" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {secondaryRaffles.map((raffle, i) => (
                <RaffleShowcase key={raffle.id} raffle={raffle} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
