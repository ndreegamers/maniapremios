import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    // Fetch the winner to know position and raffle
    const { data: winner, error: fetchErr } = await supabase
      .from("winners")
      .select("id, position, raffle_id")
      .eq("id", id)
      .single();

    if (fetchErr || !winner) {
      return NextResponse.json({ error: "Ganador no encontrado" }, { status: 404 });
    }

    // Delete the winner
    const { error: deleteErr } = await supabase
      .from("winners")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    // If it was position 1, revert raffle status to "active"
    // (only if no other position-1 winner remains for this raffle)
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
