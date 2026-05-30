import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: {
    raffle_id?: string;
    dni?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    referral_code?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const { raffle_id, dni, first_name, last_name, phone, referral_code } = body;

  // Validate required fields
  if (!raffle_id || !dni || !first_name || !last_name) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  if (!/^\d{8}$/.test(dni)) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
  }

  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "true") {
    return NextResponse.json({
      ticket_code: "DTM-0001-PRV",
      message: "Preview mode — ticket simulado",
    });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    // 1. Verify raffle is free and active
    const { data: raffle, error: raffleErr } = await supabase
      .from("raffles")
      .select("id, is_free, status, code_prefix")
      .eq("id", raffle_id)
      .single();

    if (raffleErr || !raffle) {
      return NextResponse.json({ error: "Sorteo no encontrado" }, { status: 404 });
    }
    if (!raffle.is_free) {
      return NextResponse.json({ error: "Este sorteo no es gratuito" }, { status: 400 });
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

    // 3. Call the register_free_entry RPC
    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      "register_free_entry",
      {
        p_raffle_id: raffle_id,
        p_participant_id: participant.id,
        p_referral_code: referral_code?.trim() || null,
      }
    );

    if (rpcErr) {
      // Check for known error messages from the DB function
      if (rpcErr.message?.includes("Ya estás inscrito")) {
        return NextResponse.json(
          { error: "Ya estás inscrito en este sorteo" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }

    return NextResponse.json({ ticket_code: rpcData });
  } catch (err) {
    console.error("free-entry error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
