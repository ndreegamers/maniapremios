import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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

// DELETE /api/winners/[winner_id] — admin only
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ raffle_id: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { raffle_id: winner_id } = await params;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    // Fetch winner to know position and raffle
    const { data: winner, error: fetchErr } = await supabase
      .from("winners")
      .select("id, position, raffle_id")
      .eq("id", winner_id)
      .single();

    if (fetchErr || !winner) {
      return NextResponse.json({ error: "Ganador no encontrado" }, { status: 404 });
    }

    const { error: deleteErr } = await supabase
      .from("winners")
      .delete()
      .eq("id", winner_id);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    // If position 1 was deleted and no other pos-1 winner remains, revert raffle to active
    if (winner.position === 1) {
      const { count } = await supabase
        .from("winners")
        .select("id", { count: "exact", head: true })
        .eq("raffle_id", winner.raffle_id)
        .eq("position", 1);

      if ((count ?? 0) === 0) {
        await supabase
          .from("raffles")
          .update({ status: "active" })
          .eq("id", winner.raffle_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
