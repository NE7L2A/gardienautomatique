import { NextRequest, NextResponse } from "next/server";
import { requete, type LigneBd } from "@/lib/db";

interface LigneDispositif extends LigneBd {
  dev_eui: string;
  device_name: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ dev_eui: string }> }
) {
  const { dev_eui } = await params;
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
  const champs: string[] = [];
  const parametres: unknown[] = [];

  if (brut.device_name !== undefined) {
    if (typeof brut.device_name !== "string") {
      return NextResponse.json({ erreur: "device_name doit être une chaîne." }, { status: 400 });
    }
    parametres.push(brut.device_name.trim() || null);
    champs.push(`device_name = $${parametres.length}`);
  }
  if (brut.latitude !== undefined) {
    if (typeof brut.latitude !== "number" || !Number.isFinite(brut.latitude)) {
      return NextResponse.json({ erreur: "latitude doit être un nombre." }, { status: 400 });
    }
    parametres.push(brut.latitude);
    champs.push(`latitude = $${parametres.length}`);
  }
  if (brut.longitude !== undefined) {
    if (typeof brut.longitude !== "number" || !Number.isFinite(brut.longitude)) {
      return NextResponse.json({ erreur: "longitude doit être un nombre." }, { status: 400 });
    }
    parametres.push(brut.longitude);
    champs.push(`longitude = $${parametres.length}`);
  }

  if (champs.length === 0) {
    return NextResponse.json({ erreur: "Aucun champ à mettre à jour." }, { status: 400 });
  }

  parametres.push(dev_eui);

  try {
    const lignes = await requete<LigneDispositif>(
      `UPDATE sensor_data SET ${champs.join(", ")} WHERE dev_eui = $${parametres.length}
       RETURNING dev_eui, device_name, latitude, longitude`,
      parametres
    );
    if (lignes.length === 0) {
      return NextResponse.json({ erreur: "Dispositif introuvable." }, { status: 404 });
    }
    return NextResponse.json(lignes[0]);
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la mise à jour du dispositif." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ dev_eui: string }> }
) {
  const { dev_eui } = await params;

  try {
    await requete(`DELETE FROM sensor_readings WHERE dev_eui = $1`, [dev_eui]);
    const lignes = await requete<LigneDispositif>(
      `DELETE FROM sensor_data WHERE dev_eui = $1 RETURNING dev_eui`,
      [dev_eui]
    );
    if (lignes.length === 0) {
      return NextResponse.json({ erreur: "Dispositif introuvable." }, { status: 404 });
    }
    return NextResponse.json({ statut: "supprimé", dev_eui });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la suppression du dispositif." },
      { status: 500 }
    );
  }
}
