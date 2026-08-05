import { NextRequest, NextResponse } from "next/server";
import { envoyerSMS, envoyerEmail, type ResultatEnvoi } from "@/lib/envoi";
import { requete, type LigneBd } from "@/lib/db";

interface LigneConfig extends LigneBd {
  email: string | null;
  sms: string | null;
}

async function destinatairesDefaut(): Promise<{ sms?: string; email?: string }> {
  try {
    const lignes = await requete<LigneConfig>(
      `SELECT email, sms FROM alert_config ORDER BY id DESC LIMIT 1`
    );
    const l = lignes[0];
    return {
      sms: l?.sms ?? undefined,
      email: l?.email ?? undefined,
    };
  } catch {
    return {};
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
    return NextResponse.json({ erreur: "Corps de requête invalide." }, { status: 400 });
  }

  const brut = corps as Record<string, unknown>;

  if (typeof brut.message !== "string" || !brut.message.trim()) {
    return NextResponse.json({ erreur: "Le champ message est requis." }, { status: 400 });
  }
  const message = brut.message.trim();
  if (message.length > 1600) {
    return NextResponse.json(
      { erreur: "Le message ne doit pas dépasser 1600 caractères." },
      { status: 400 }
    );
  }

  const sujet =
    typeof brut.sujet === "string" && brut.sujet.trim()
      ? brut.sujet.trim()
      : "EYESHOME — Alerte sécurité";

  let sms = typeof brut.sms === "string" && brut.sms.trim() ? brut.sms.trim() : undefined;
  let email =
    typeof brut.email === "string" && brut.email.trim() ? brut.email.trim() : undefined;

  if (!sms && !email) {
    const defaut = await destinatairesDefaut();
    sms = defaut.sms;
    email = defaut.email;
  }

  if (!sms && !email) {
    return NextResponse.json(
      { erreur: "Aucun destinataire (sms/email). Configurez un contact d'abord." },
      { status: 400 }
    );
  }

  const resultats: ResultatEnvoi[] = [];
  if (sms) resultats.push(await envoyerSMS(sms, message));
  if (email) resultats.push(await envoyerEmail(email, sujet, message));

  const erreurs = resultats.filter((r) => r.statut === "erreur");
  if (erreurs.length > 0) {
    return NextResponse.json(
      { resultats, erreur: "Échec de l'envoi sur un ou plusieurs canaux." },
      { status: 502 }
    );
  }

  return NextResponse.json({ resultats });
}
