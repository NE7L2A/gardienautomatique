import { NextRequest, NextResponse } from "next/server";
import { requete, type LigneBd } from "@/lib/db";

interface LigneDispositif extends LigneBd {
  dev_eui: string;
  device_name: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function GET() {
  try {
    const lignes = await requete<LigneDispositif>(
      `SELECT dev_eui, device_name, latitude, longitude FROM sensor_data ORDER BY dev_eui`
    );
    return NextResponse.json(
      lignes.map((l) => ({
        dev_eui: l.dev_eui,
        device_name: l.device_name,
        latitude: l.latitude,
        longitude: l.longitude,
      }))
    );
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la lecture des dispositifs." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Corps JSON invalide." }, { status: 400 });
  }

  if (typeof corps !== "object" || corps === null || Array.isArray(corps)) {
    return NextResponse.json({ erreur: "Corps invalide." }, { status: 400 });
  }

  const brut = corps as Record<string, unknown>;

  if (typeof brut.dev_eui !== "string" || !brut.dev_eui.trim()) {
    return NextResponse.json({ erreur: "dev_eui est requis." }, { status: 400 });
  }
  const devEui = brut.dev_eui.trim();
  if (devEui.length > 50) {
    return NextResponse.json({ erreur: "dev_eui ne doit pas dépasser 50 caractères." }, { status: 400 });
  }

  let deviceName: string | null = null;
  if (brut.device_name !== undefined && brut.device_name !== null) {
    if (typeof brut.device_name !== "string") {
      return NextResponse.json({ erreur: "device_name doit être une chaîne." }, { status: 400 });
    }
    deviceName = brut.device_name.trim() || null;
  }

  let latitude: number | null = null;
  if (brut.latitude !== undefined && brut.latitude !== null) {
    if (typeof brut.latitude !== "number" || !Number.isFinite(brut.latitude)) {
      return NextResponse.json({ erreur: "latitude doit être un nombre." }, { status: 400 });
    }
    latitude = brut.latitude;
  }

  let longitude: number | null = null;
  if (brut.longitude !== undefined && brut.longitude !== null) {
    if (typeof brut.longitude !== "number" || !Number.isFinite(brut.longitude)) {
      return NextResponse.json({ erreur: "longitude doit être un nombre." }, { status: 400 });
    }
    longitude = brut.longitude;
  }

  try {
    const lignes = await requete<LigneDispositif>(
      `INSERT INTO sensor_data (dev_eui, device_name, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (dev_eui) DO UPDATE SET
         device_name = COALESCE(EXCLUDED.device_name, sensor_data.device_name),
         latitude = COALESCE(EXCLUDED.latitude, sensor_data.latitude),
         longitude = COALESCE(EXCLUDED.longitude, sensor_data.longitude)
       RETURNING dev_eui, device_name, latitude, longitude`,
      [devEui, deviceName, latitude, longitude]
    );
    return NextResponse.json(lignes[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la création du dispositif." },
      { status: 500 }
    );
  }
}
