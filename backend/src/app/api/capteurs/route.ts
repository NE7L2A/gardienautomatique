import { NextResponse } from "next/server";
import { requete, type LigneBd } from "@/lib/db";

interface LigneLecture extends LigneBd {
  id: number;
  dev_eui: string;
  timestamp: string;
  temperature: string | null;
  humidite: string | null;
  gaz_pourcent: number | null;
  presence: string | null;
}

function convertir(l: LigneLecture) {
  return {
    id: l.id,
    device_id: l.dev_eui,
    timestamp: l.timestamp,
    temperature: l.temperature === null ? null : Number(l.temperature),
    humidite: l.humidite === null ? null : Number(l.humidite),
    gaz_pourcent: l.gaz_pourcent,
    presence: l.presence,
  };
}

export async function GET() {
  try {
    const lignes = await requete<LigneLecture>(
      `SELECT DISTINCT ON (dev_eui) dev_eui, timestamp, temperature, humidite, gaz_pourcent, presence
       FROM sensor_readings
       ORDER BY dev_eui, timestamp DESC`
    );
    return NextResponse.json(lignes.map(convertir));
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la lecture des capteurs." },
      { status: 500 }
    );
  }
}
