import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: {
    code?: string;
    raffle_id?: string;
    dni?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const { code, raffle_id, dni, first_name, last_name, phone } = body;

  if (!code || !raffle_id || !dni || !first_name || !last_name) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  if (!/^\d{8}$/.test(dni)) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
  }

  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "true") {
    return NextResponse.json({
      ticket_code: "DTM-0001-PRV",
      message: "Preview mode — cupón simulado",
    });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    // 1. Verify raffle is active (not required to be free)
    const { data: raffle, error: raffleErr } = await supabase
      .from("raffles")
      .select("id, status")
      .eq("id", raffle_id)
      .single();

    if (raffleErr || !raffle) {
      return NextResponse.json({ error: "Sorteo no encontrado" }, { status: 404 });
    }
    if (raffle.status !== "active") {
      return NextResponse.json({ error: "El sorteo no está activo" }, { status: 400 });
    }

    // 2. Upsert participant by DNI
    const { data: participant, error: participantErr } = await supabase
      .from("participants")
      .upsert(
        { dni, first_name, last_name, phone: phone || null },
        { onConflict: "dni", ignoreDuplicates: false }
      )
      .select("id, dni")
      .single();

    if (participantErr || !participant) {
      return NextResponse.json(
        { error: participantErr?.message ?? "Error al registrar participante" },
        { status: 500 }
      );
    }

    // 3. Call the redeem_coupon RPC (handles all validation atomically)
    const { data: ticketCode, error: rpcErr } = await supabase.rpc("redeem_coupon", {
      p_code: code.trim().toUpperCase(),
      p_raffle_id: raffle_id,
      p_participant_id: participant.id,
    });

    if (rpcErr) {
      const msg = rpcErr.message ?? "";
      if (msg.includes("inválido o ya usado")) {
        return NextResponse.json(
          { error: "El cupón es inválido o ya fue usado" },
          { status: 409 }
        );
      }
      if (msg.includes("no está activo")) {
        return NextResponse.json({ error: "El sorteo no está activo" }, { status: 400 });
      }
      return NextResponse.json({ error: msg || "Error al canjear cupón" }, { status: 500 });
    }

    return NextResponse.json({ ticket_code: ticketCode });
  } catch (err) {
    console.error("POST /api/coupons/redeem error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
