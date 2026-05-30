import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VerifyResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dni = searchParams.get("dni")?.trim();

  if (!dni || !/^\d{8}$/.test(dni)) {
    return NextResponse.json(
      { error: "DNI debe tener exactamente 8 dígitos" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: participant } = await supabase
    .from("participants")
    .select("*")
    .eq("dni", dni)
    .maybeSingle();

  if (!participant) {
    const result: VerifyResult = {
      participant: null,
      tickets: [],
      pending_purchases: 0,
      rejected_purchases: 0,
    };
    return NextResponse.json(result);
  }

  const { data: tickets } = await supabase
    .from("tickets")
    .select(
      `
      *,
      raffle:raffles(id, title, draw_date, image_url)
    `
    )
    .eq("participant_id", participant.id)
    .order("ticket_number", { ascending: true });

  const { data: purchases } = await supabase
    .from("purchases")
    .select("payment_status")
    .eq("participant_id", participant.id);

  const pending_purchases =
    purchases?.filter((p) => p.payment_status === "pending").length ?? 0;
  const rejected_purchases =
    purchases?.filter((p) => p.payment_status === "rejected").length ?? 0;

  const result: VerifyResult = {
    participant,
    tickets: tickets ?? [],
    pending_purchases,
    rejected_purchases,
  };

  return NextResponse.json(result);
}
