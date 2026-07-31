import { NextResponse } from "next/server";
import { requete, type LigneBd } from "@/lib/db";

interface LigneLecture extends LigneBd {
  id: number;
  device_id: string;
  timestamp: string;
  temperature: string | null;
  humidite: string | null;
  gaz_pourcent: number | null;
  presence: string | null;
  nom: string | null;
}

function convertir(l: LigneLecture) {
  return {
    id: l.id,
    device_id: l.device_id,
    nom: l.nom,
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
      `SELECT DISTINCT ON (device_id) *
       FROM sensor_readings
       ORDER BY device_id, timestamp DESC`
    );
    return NextResponse.json(lignes.map(convertir));
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la lecture des capteurs." },
      { status: 500 }
    );
  }
}
