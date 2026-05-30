import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function generateCode(firstName: string): string {
  const base = firstName
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z]/g, "")
    .slice(0, 6);
  const suffix = Math.floor(Math.random() * 900 + 100); // 3-digit random
  return `${base}${suffix}`;
}

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("referral_codes")
      .select(`
        id, code, created_at,
        participant:participants(id, dni, first_name, last_name),
        referral_uses(id)
      `)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const codes = (data ?? []).map((row: any) => {
      const p = Array.isArray(row.participant) ? row.participant[0] ?? null : row.participant ?? null;
      return {
        id: row.id as string,
        code: row.code as string,
        created_at: row.created_at as string,
        participant: p,
        uses_count: (row.referral_uses?.length ?? 0) as number,
      };
    });

    return NextResponse.json({ codes });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { dni?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { dni, code } = body;

  if (!dni || !/^\d{8}$/.test(dni)) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    // Find participant by DNI — must already be registered
    const { data: participant, error: pErr } = await supabase
      .from("participants")
      .select("id, first_name, last_name, dni")
      .eq("dni", dni)
      .single();

    if (pErr || !participant) {
      return NextResponse.json(
        { error: "Usuario no encontrado. El usuario debe estar registrado previamente." },
        { status: 404 }
      );
    }

    // Generate or use provided code
    const finalCode = (code?.trim().toUpperCase()) || generateCode(participant.first_name);

    // Upsert referral code (one per participant)
    const { data: refCode, error: refErr } = await supabase
      .from("referral_codes")
      .upsert(
        { participant_id: participant.id, code: finalCode },
        { onConflict: "participant_id" }
      )
      .select("id, code")
      .single();

    if (refErr) {
      if (refErr.message?.includes("unique") || refErr.code === "23505") {
        return NextResponse.json(
          { error: "Ese código ya está en uso. Elige otro." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: refErr.message }, { status: 500 });
    }

    return NextResponse.json({
      participant: { id: participant.id, dni: participant.dni, name: `${participant.first_name} ${participant.last_name}` },
      code: refCode.code,
      id: refCode.id,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta el id del código" }, { status: 400 });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { error } = await supabase.from("referral_codes").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
