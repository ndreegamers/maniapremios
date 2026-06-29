import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import * as XLSX from "xlsx";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: raffleId } = await params;

  const supabase = createAdminClient();

  // Fetch raffle info for the filename
  const { data: raffle, error: raffleErr } = await supabase
    .from("raffles")
    .select("id, title, code_prefix")
    .eq("id", raffleId)
    .single();

  if (raffleErr || !raffle) {
    return NextResponse.json({ error: "Sorteo no encontrado" }, { status: 404 });
  }

  // Fetch all tickets for this raffle, joined with participant data and purchase source
  const { data: tickets, error: ticketsErr } = await supabase
    .from("tickets")
    .select(
      `
      ticket_code,
      ticket_number,
      created_at,
      participant:participants(first_name, last_name, dni, phone),
      purchase:purchases(source)
    `
    )
    .eq("raffle_id", raffleId)
    .order("ticket_number", { ascending: true });

  if (ticketsErr) {
    return NextResponse.json({ error: ticketsErr.message }, { status: 500 });
  }

  // Build worksheet rows
  const SOURCE_LABEL: Record<string, string> = {
    paid: "Pago",
    free: "Gratuito",
    referral_reward: "Referido",
  };

  const rows = (tickets ?? []).map((t) => {
    const p = (t.participant as unknown) as {
      first_name: string;
      last_name: string;
      dni: string;
      phone: string | null;
    } | null;
    const src = ((t.purchase as unknown) as { source?: string } | null)?.source ?? "paid";

    return {
      "Código Ticket": t.ticket_code,
      "N° Ticket": t.ticket_number,
      Nombre: p?.first_name ?? "",
      Apellido: p?.last_name ?? "",
      DNI: p?.dni ?? "",
      Teléfono: p?.phone ?? "",
      Origen: SOURCE_LABEL[src] ?? src,
      "Fecha de registro": t.created_at
        ? new Date(t.created_at).toLocaleString("es-PE", { timeZone: "America/Lima" })
        : "",
    };
  });

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws["!cols"] = [
    { wch: 18 }, // Código Ticket
    { wch: 10 }, // N° Ticket
    { wch: 20 }, // Nombre
    { wch: 20 }, // Apellido
    { wch: 12 }, // DNI
    { wch: 15 }, // Teléfono
    { wch: 12 }, // Origen
    { wch: 22 }, // Fecha
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Participantes");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const safeTitle = raffle.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
  const filename = `participantes_${raffle.code_prefix}_${safeTitle}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
