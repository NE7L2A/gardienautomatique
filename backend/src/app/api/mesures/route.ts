import { NextRequest, NextResponse } from "next/server";
import { requete, type LigneBd } from "@/lib/db";
import { validerMesure } from "@/lib/validation";

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

export async function POST(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Corps JSON invalide." }, { status: 400 });
  }

  const valide = validerMesure(corps);
  if (!valide.ok) {
    return NextResponse.json({ erreur: valide.erreur }, { status: 400 });
  }

  const m = valide.donnees;
  try {
    const lignes = await requete<LigneLecture>(
      `INSERT INTO sensor_readings (device_id, nom, temperature, humidite, gaz_pourcent, presence)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        m.device_id,
        m.nom ?? null,
        m.temperature ?? null,
        m.humidite ?? null,
        m.gaz_pourcent ?? null,
        m.presence ?? null,
      ]
    );
    return NextResponse.json(convertir(lignes[0]), { status: 201 });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de l'enregistrement de la mesure." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const deviceId = url.searchParams.get("device_id");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const limitRaw = url.searchParams.get("limit");

  const conditions: string[] = [];
  const parametres: unknown[] = [];

  if (deviceId) {
    parametres.push(deviceId);
    conditions.push(`device_id = $${parametres.length}`);
  }

  if (from) {
    const date = new Date(from);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { erreur: "Le paramètre from doit être une date valide." },
        { status: 400 }
      );
    }
    parametres.push(date.toISOString());
    conditions.push(`timestamp >= $${parametres.length}`);
  }

  if (to) {
    const date = new Date(to);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { erreur: "Le paramètre to doit être une date valide." },
        { status: 400 }
      );
    }
    parametres.push(date.toISOString());
    conditions.push(`timestamp <= $${parametres.length}`);
  }

  let limit = 500;
  if (limitRaw) {
    limit = parseInt(limitRaw, 10);
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { erreur: "Le paramètre limit doit être un entier positif." },
        { status: 400 }
      );
    }
    limit = Math.min(limit, 2000);
  }
  parametres.push(limit);

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const lignes = await requete<LigneLecture>(
      `SELECT * FROM sensor_readings ${where}
       ORDER BY timestamp DESC
       LIMIT $${parametres.length}`,
      parametres
    );
    return NextResponse.json(lignes.map(convertir));
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la lecture des mesures." },
      { status: 500 }
    );
  }
}
