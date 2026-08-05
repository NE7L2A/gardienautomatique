import { NextRequest, NextResponse } from "next/server";
import { requete, type LigneBd } from "@/lib/db";

interface LigneCompteur extends LigneBd {
  nb: number;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ device_id: string }> }
) {
  const { device_id } = await params;
  if (!device_id || !device_id.trim()) {
    return NextResponse.json({ erreur: "device_id est requis." }, { status: 400 });
  }

  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Corps JSON invalide." }, { status: 400 });
  }

  const brut = corps as Record<string, unknown>;
  if (typeof brut.nom !== "string" || !brut.nom.trim()) {
    return NextResponse.json({ erreur: "Le champ nom est requis." }, { status: 400 });
  }
  const nom = brut.nom.trim();
  if (nom.length > 50) {
    return NextResponse.json(
      { erreur: "nom ne doit pas dépasser 50 caractères." },
      { status: 400 }
    );
  }

  try {
    const lignes = await requete<LigneCompteur>(
      `UPDATE sensor_readings
       SET nom = $1
       WHERE device_id = $2
       RETURNING count(*)::int AS nb`,
      [nom, device_id]
    );
    return NextResponse.json({
      device_id,
      nom,
      lignes_mises_a_jour: lignes[0]?.nb ?? 0,
    });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la mise à jour du dispositif." },
      { status: 500 }
    );
  }
}
