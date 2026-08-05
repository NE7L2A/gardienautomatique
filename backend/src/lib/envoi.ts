import twilio from "twilio";
import nodemailer from "nodemailer";

export interface ResultatEnvoi {
  canal: "sms" | "email";
  statut: "envoye" | "non_configuré" | "erreur";
  destinataire: string;
  erreur?: string;
}

function creerClientTwilio() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

function creerTransporteur() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: (process.env.SMTP_SECURE || "false") === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

function messageErreur(erreur: unknown): string {
  if (erreur instanceof Error) return erreur.message;
  return String(erreur);
}

export async function envoyerSMS(
  destinataire: string,
  message: string
): Promise<ResultatEnvoi> {
  const client = creerClientTwilio();
  const numero = process.env.TWILIO_FROM_NUMBER;
  if (!client || !numero) {
    return { canal: "sms", statut: "non_configuré", destinataire };
  }
  try {
    await client.messages.create({
      body: message,
      to: destinataire,
      from: numero,
    });
    return { canal: "sms", statut: "envoye", destinataire };
  } catch (erreur) {
    return {
      canal: "sms",
      statut: "erreur",
      destinataire,
      erreur: messageErreur(erreur),
    };
  }
}

export async function envoyerEmail(
  destinataire: string,
  sujet: string,
  corps: string
): Promise<ResultatEnvoi> {
  const transporteur = creerTransporteur();
  const expediteur = process.env.SMTP_FROM;
  if (!transporteur || !expediteur) {
    return { canal: "email", statut: "non_configuré", destinataire };
  }
  try {
    await transporteur.sendMail({
      from: expediteur,
      to: destinataire,
      subject: sujet,
      text: corps,
    });
    return { canal: "email", statut: "envoye", destinataire };
  } catch (erreur) {
    return {
      canal: "email",
      statut: "erreur",
      destinataire,
      erreur: messageErreur(erreur),
    };
  }
}
