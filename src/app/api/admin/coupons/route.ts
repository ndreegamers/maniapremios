import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value ?? null;
}

/** GET /api/admin/coupons — list all coupons with redeemer info */
export async function GET() {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("coupons")
    .select(
      `
      id, code, redeemed_at, redeemed_by, raffle_id, created_at,
      redeemer:participants!coupons_redeemed_by_fkey(id, dni, first_name, last_name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupons: data ?? [] });
}

/** POST /api/admin/coupons — generate one or more coupons */
export async function POST(request: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { count?: number } = {};
  try {
    body = await request.json();
  } catch {
    // no body is fine — default to 1
  }

  const count = Math.min(Math.max(1, body.count ?? 1), 50); // 1-50 coupons max

  const supabase = createAdminClient();

  // Generate unique codes: CUP-XXXXXX (6 random alphanumeric chars)
  const generated: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

  for (let i = 0; i < count; i++) {
    let code = "";
    for (let j = 0; j < 6; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    generated.push(`CUP-${code}`);
  }

  const { data, error } = await supabase
    .from("coupons")
    .insert(generated.map((code) => ({ code })))
    .select("id, code, created_at");

  if (error) {
    // If there's a collision (rare), return a meaningful error
    return NextResponse.json(
      { error: "Error al generar cupones. Inténtalo de nuevo." },
      { status: 500 }
    );
  }

  return NextResponse.json({ coupons: data ?? [] }, { status: 201 });
}

/** DELETE /api/admin/coupons?id=<uuid> — delete an unused coupon */
export async function DELETE(request: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Only allow deleting unused coupons
  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", id)
    .is("redeemed_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
