import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requete, type LigneBd } from "@/lib/db";

interface LigneConfig extends LigneBd {
  email: string | null;
}

interface CorpsEnvoi {
  email?: string;
  titre?: string;
  message?: string;
}

function validerCorps(corps: unknown): CorpsEnvoi | null {
  if (typeof corps !== "object" || corps === null || Array.isArray(corps)) {
    return null;
  }
  const brut = corps as Record<string, unknown>;
  const sortie: CorpsEnvoi = {};
  if (brut.email !== undefined) {
    if (typeof brut.email !== "string" || !brut.email.trim()) return null;
    sortie.email = brut.email.trim();
  }
  if (brut.titre !== undefined) {
    if (typeof brut.titre !== "string") return null;
    sortie.titre = brut.titre.trim();
  }
  if (brut.message !== undefined) {
    if (typeof brut.message !== "string") return null;
    sortie.message = brut.message.trim();
  }
  return sortie;
}

function transporterDisponible(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

export async function POST(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Corps JSON invalide." }, { status: 400 });
  }

  const valide = validerCorps(corps);
  if (!valide) {
    return NextResponse.json(
      { erreur: "Champs invalides. Attendus : email, titre, message." },
      { status: 400 }
    );
  }

  if (!transporterDisponible()) {
    return NextResponse.json(
      { erreur: "SMTP non configuré — envoi impossible." },
      { status: 500 }
    );
  }

  let destinataire = valide.email;
  if (!destinataire) {
    try {
      const lignes = await requete<LigneConfig>(
        `SELECT email FROM alert_config ORDER BY id DESC LIMIT 1`
      );
      destinataire = lignes[0]?.email ?? "";
    } catch {
      return NextResponse.json(
        { erreur: "Erreur lors de la lecture de la configuration." },
        { status: 500 }
      );
    }
  }

  if (!destinataire) {
    return NextResponse.json(
      { erreur: "Aucune adresse email de réception configurée." },
      { status: 400 }
    );
  }

  const titre = valide.titre || "EYESHOME — Alerte sécurité";
  const message = valide.message || "Alerte détectée par le système EYESHOME.";

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `EYESHOME <${process.env.SMTP_FROM}>`,
      to: destinataire,
      subject: titre,
      text: message,
      html: `<div style="font-family:sans-serif;color:#1a2332;line-height:1.6">
        <h2 style="color:#232f3e">EYESHOME — Sécurité domestique</h2>
        <p style="font-size:14px">${message}</p>
        <p style="font-size:12px;color:#64748b">Envoyé automatiquement par le système de surveillance EYESHOME.</p>
      </div>`,
    });

    return NextResponse.json({ statut: "envoye", destinataire });
  } catch {
    return NextResponse.json(
      { erreur: "Échec de l'envoi de l'email." },
      { status: 500 }
    );
  }
}
