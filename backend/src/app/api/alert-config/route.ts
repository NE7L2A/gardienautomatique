import { NextRequest, NextResponse } from "next/server";
import { requete, type LigneBd } from "@/lib/db";
import { validerConfigAlerte } from "@/lib/validation";

interface LigneConfig extends LigneBd {
  id: number;
  email: string | null;
  sms: string | null;
  temp_min: string | null;
  temp_max: string | null;
  hum_min: string | null;
  hum_max: string | null;
  gaz_max: number | null;
}

function convertir(l: LigneConfig) {
  return {
    id: l.id,
    email: l.email,
    sms: l.sms,
    temp_min: l.temp_min === null ? null : Number(l.temp_min),
    temp_max: l.temp_max === null ? null : Number(l.temp_max),
    hum_min: l.hum_min === null ? null : Number(l.hum_min),
    hum_max: l.hum_max === null ? null : Number(l.hum_max),
    gaz_max: l.gaz_max,
  };
}

export async function GET() {
  try {
    const lignes = await requete<LigneConfig>(
      `SELECT * FROM alert_config ORDER BY id DESC LIMIT 1`
    );
    if (lignes.length === 0) {
      return NextResponse.json(
        { erreur: "Aucune configuration d'alerte trouvée." },
        { status: 404 }
      );
    }
    return NextResponse.json(convertir(lignes[0]));
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la lecture de la configuration." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Corps JSON invalide." }, { status: 400 });
  }

  const valide = validerConfigAlerte(corps);
  if (!valide.ok) {
    return NextResponse.json({ erreur: valide.erreur }, { status: 400 });
  }

  const c = valide.donnees;
  try {
    const lignes = await requete<LigneConfig>(
      `UPDATE alert_config
       SET email = COALESCE($1, email),
           sms = COALESCE($2, sms),
           temp_min = COALESCE($3, temp_min),
           temp_max = COALESCE($4, temp_max),
           hum_min = COALESCE($5, hum_min),
           hum_max = COALESCE($6, hum_max),
           gaz_max = COALESCE($7, gaz_max)
       WHERE id = (SELECT id FROM alert_config ORDER BY id DESC LIMIT 1)
       RETURNING *`,
      [
        c.email ?? null,
        c.sms ?? null,
        c.temp_min ?? null,
        c.temp_max ?? null,
        c.hum_min ?? null,
        c.hum_max ?? null,
        c.gaz_max ?? null,
      ]
    );
    if (lignes.length === 0) {
      return NextResponse.json(
        { erreur: "Aucune configuration d'alerte trouvée." },
        { status: 404 }
      );
    }
    return NextResponse.json(convertir(lignes[0]));
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la mise à jour de la configuration." },
      { status: 500 }
    );
  }
}
