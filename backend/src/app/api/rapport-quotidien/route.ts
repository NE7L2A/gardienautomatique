import { NextRequest, NextResponse } from "next/server";
import { envoyerEmail, type ResultatEnvoi } from "@/lib/envoi";
import { requete, type LigneBd } from "@/lib/db";

export const dynamic = "force-dynamic";

interface LigneMoyenne extends LigneBd {
  device_id: string;
  nom: string | null;
  temp_moy: string | null;
  hum_moy: string | null;
  gaz_moy: string | null;
}

interface LigneContact extends LigneBd {
  email: string | null;
}

function arrondir(valeur: string | null): number | null {
  if (valeur === null) return null;
  return Math.round(Number(valeur) * 10) / 10;
}

async function calculerMoyennesJour(): Promise<LigneMoyenne[]> {
  return requete<LigneMoyenne>(
    `SELECT
       device_id,
       MAX(nom) AS nom,
       AVG(temperature)::text AS temp_moy,
       AVG(humidite)::text AS hum_moy,
       AVG(gaz_pourcent)::text AS gaz_moy
     FROM sensor_readings
     WHERE timestamp >= date_trunc('day', now())
     GROUP BY device_id
     ORDER BY device_id`
  );
}

function construireRapport(lignes: LigneMoyenne[]): string {
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const titre = `EYESHOME — Rapport quotidien du ${date}`;
  const separateur = "=".repeat(titre.length);

  if (lignes.length === 0) {
    return `${titre}\n${separateur}\n\nAucune mesure enregistrée aujourd'hui.`;
  }

  const lignesTexte = lignes.map((l) => {
    const nom = l.nom || l.device_id;
    const parties = [`• ${nom} (${l.device_id})`];
    const temp = arrondir(l.temp_moy);
    const hum = arrondir(l.hum_moy);
    const gaz = arrondir(l.gaz_moy);
    if (temp !== null) parties.push(`  Température moyenne : ${temp}°C`);
    if (hum !== null) parties.push(`  Humidité moyenne : ${hum}%`);
    if (gaz !== null) parties.push(`  Gaz moyen : ${gaz}%`);
    return parties.join("\n");
  });

  return [titre, separateur, "", "Moyennes journalières par capteur :", "", ...lignesTexte, "", "Rapport généré automatiquement par EYESHOME."].join("\n");
}

export async function GET() {
  try {
    const lignes = await calculerMoyennesJour();
    return NextResponse.json({
      date: new Date().toISOString().slice(0, 10),
      dispositifs: lignes.map((l) => ({
        device_id: l.device_id,
        nom: l.nom,
        temperature_moyenne: arrondir(l.temp_moy),
        humidite_moyenne: arrondir(l.hum_moy),
        gaz_moyen: arrondir(l.gaz_moy),
      })),
    });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors du calcul des moyennes." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let email: string | undefined;
  if (req) {
    try {
      const corps = await req.json();
      if (
        corps &&
        typeof corps === "object" &&
        typeof (corps as Record<string, unknown>).email === "string"
      ) {
        const brut = (corps as Record<string, unknown>).email as string;
        if (brut.trim()) email = brut.trim();
      }
    } catch {
      // corps optionnel
    }
  }

  if (!email) {
    try {
      const contacts = await requete<LigneContact>(
        `SELECT email FROM alert_config ORDER BY id DESC LIMIT 1`
      );
      email = contacts[0]?.email ?? undefined;
    } catch {
      email = undefined;
    }
  }

  if (!email) {
    return NextResponse.json(
      { erreur: "Aucun email configuré pour recevoir le rapport." },
      { status: 400 }
    );
  }

  let lignes: LigneMoyenne[];
  try {
    lignes = await calculerMoyennesJour();
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors du calcul des moyennes." },
      { status: 500 }
    );
  }

  const rapport = construireRapport(lignes);
  const sujet = `EYESHOME — Rapport quotidien`;
  let resultat: ResultatEnvoi;
  try {
    resultat = await envoyerEmail(email, sujet, rapport);
  } catch {
    return NextResponse.json(
      { erreur: "Échec lors de l'envoi du rapport." },
      { status: 500 }
    );
  }

  if (resultat.statut !== "envoye") {
    return NextResponse.json(
      { resultat, erreur: "Rapport calculé mais envoi impossible." },
      { status: 502 }
    );
  }

  return NextResponse.json({ resultat, dispositifs: lignes.length });
}
