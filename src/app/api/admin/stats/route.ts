import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Fetch all purchases + raffle info in one query
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select(
      `
      participant_id,
      raffle_id,
      total_amount,
      total_tickets,
      payment_status,
      raffle:raffles(id, title, draw_date, status, is_free, total_tickets)
    `
    )
    .order("created_at", { ascending: true });

  if (purchasesError) {
    return NextResponse.json({ error: purchasesError.message }, { status: 500 });
  }

  const allPurchases = purchases ?? [];

  // Global aggregates
  const pendingCount = allPurchases.filter((p) => p.payment_status === "pending").length;
  const approvedCount = allPurchases.filter((p) => p.payment_status === "approved").length;
  const totalRevenue = allPurchases
    .filter((p) => p.payment_status === "approved")
    .reduce((sum, p) => sum + Number(p.total_amount), 0);

  // Per-raffle aggregates — group by raffle_id
  const raffleMap = new Map<
    string,
    {
      raffle_id: string;
      title: string;
      draw_date: string;
      status: string;
      is_free: boolean;
      total_tickets: number;
      tickets_sold: number;
      participants: Set<string>;
      revenue: number;
    }
  >();

  for (const p of allPurchases) {
    if (!p.raffle_id || !p.raffle) continue;

    const raffle = (p.raffle as unknown) as {
      id: string;
      title: string;
      draw_date: string;
      status: string;
      is_free: boolean;
      total_tickets: number;
    };

    if (!raffleMap.has(p.raffle_id)) {
      raffleMap.set(p.raffle_id, {
        raffle_id: p.raffle_id,
        title: raffle.title,
        draw_date: raffle.draw_date,
        status: raffle.status,
        is_free: raffle.is_free,
        total_tickets: raffle.total_tickets,
        tickets_sold: 0,
        participants: new Set(),
        revenue: 0,
      });
    }

    const row = raffleMap.get(p.raffle_id)!;

    if (p.payment_status === "approved") {
      row.tickets_sold += Number(p.total_tickets) || 0;
      row.revenue += Number(p.total_amount) || 0;
      if (p.participant_id) row.participants.add(p.participant_id);
    }
  }

  const perRaffle = Array.from(raffleMap.values()).map((r) => ({
    raffle_id: r.raffle_id,
    title: r.title,
    draw_date: r.draw_date,
    status: r.status,
    is_free: r.is_free,
    total_tickets: r.total_tickets,
    tickets_sold: r.tickets_sold,
    participants: r.participants.size,
    revenue: r.revenue,
  }));

  return NextResponse.json({
    pendingCount,
    approvedCount,
    totalRevenue,
    perRaffle,
  });
}
