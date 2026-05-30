import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { maskName } from "@/lib/utils";

export async function GET() {
  try {
    const { createAdminClient: admin } = await import("@/lib/supabase/admin");
    const supabase = admin();

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
      .order("drawn_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const winners = (data ?? [] as any[]).map((w: any) => {
      const ticket = Array.isArray(w.ticket) ? w.ticket[0] : w.ticket;
      const raffle = Array.isArray(w.raffle) ? w.raffle[0] : w.raffle;
      const participant = Array.isArray(ticket?.participant) ? ticket.participant[0] : ticket?.participant;

      if (raffle?.status !== "completed") return null;

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
    }).filter(Boolean);

    return NextResponse.json({ winners });
  } catch {
    return NextResponse.json({ winners: [] });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { raffle_id, ticket_code, position = 1, prize_description, notes } = body;

  if (!raffle_id || !ticket_code) {
    return NextResponse.json({ error: "raffle_id y ticket_code son requeridos" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, raffle_id")
    .eq("ticket_code", ticket_code.trim().toUpperCase())
    .maybeSingle();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: "Código de ticket no encontrado" }, { status: 404 });
  }

  if (ticket.raffle_id !== raffle_id) {
    return NextResponse.json(
      { error: "El ticket no pertenece a este sorteo" },
      { status: 400 }
    );
  }

  const { data: winner, error: winnerError } = await supabase
    .from("winners")
    .insert({
      raffle_id,
      ticket_id: ticket.id,
      position,
      prize_description: prize_description ?? null,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (winnerError) {
    return NextResponse.json({ error: winnerError.message }, { status: 500 });
  }

  if (position === 1) {
    await supabase
      .from("raffles")
      .update({ status: "completed" })
      .eq("id", raffle_id);
  }

  return NextResponse.json({ winner }, { status: 201 });
}
