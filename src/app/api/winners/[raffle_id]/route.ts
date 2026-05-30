import { NextRequest, NextResponse } from "next/server";
import { maskName } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ raffle_id: string }> }
) {
  const { raffle_id } = await params;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("winners")
      .select(
        `
        id,
        position,
        prize_description,
        drawn_at,
        ticket:tickets(
          ticket_code,
          participant:participants(first_name, last_name)
        ),
        raffle:raffles(id, title, image_url, status)
      `
      )
      .eq("raffle_id", raffle_id)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const winners = (data ?? [] as any[]).map((w: any) => {
      const ticket = Array.isArray(w.ticket) ? w.ticket[0] : w.ticket;
      const raffle = Array.isArray(w.raffle) ? w.raffle[0] : w.raffle;
      const participant = Array.isArray(ticket?.participant) ? ticket.participant[0] : ticket?.participant;

      return {
        id: w.id,
        position: w.position,
        prize_description: w.prize_description ?? null,
        drawn_at: w.drawn_at,
        ticket_code: ticket?.ticket_code ?? "",
        masked_name: maskName(
          participant?.first_name ?? "",
          participant?.last_name ?? ""
        ),
        raffle_title: raffle?.title ?? "",
        raffle_image: raffle?.image_url ?? "",
      };
    });

    return NextResponse.json({ winners });
  } catch {
    return NextResponse.json({ winners: [] });
  }
}
