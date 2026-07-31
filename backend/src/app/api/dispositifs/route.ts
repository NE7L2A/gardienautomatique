import { NextResponse } from "next/server";
import { requete, type LigneBd } from "@/lib/db";

interface LigneDispositif extends LigneBd {
  device_id: string;
  nom: string | null;
}

export async function GET() {
  try {
    const lignes = await requete<LigneDispositif>(
      `SELECT DISTINCT ON (device_id) device_id, nom
       FROM sensor_readings
       ORDER BY device_id, timestamp DESC`
    );
    return NextResponse.json(
      lignes.map((l) => ({ device_id: l.device_id, nom: l.nom }))
    );
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la lecture des dispositifs." },
      { status: 500 }
    );
  }
}
