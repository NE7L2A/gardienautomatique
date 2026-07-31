import { NextResponse } from "next/server";
import { pingBd } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await pingBd();
    return NextResponse.json({ statut: "ok", bd: "ok" });
  } catch {
    return NextResponse.json({ statut: "erreur", bd: "ko" }, { status: 503 });
  }
}
