import { API_BASE_URL } from "./config";
import type { Lecture, PresenceValeur } from "@/types";

async function requeteJson<T>(
  chemin: string,
  options?: RequestInit
): Promise<T | null> {
  const controleur = new AbortController();
  const delai = setTimeout(() => controleur.abort(), 8000);
  try {
    const reponse = await fetch(`${API_BASE_URL}${chemin}`, {
      ...options,
      signal: controleur.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });
    if (!reponse.ok) return null;
    return (await reponse.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(delai);
  }
}

function requeteApi(chemin: string, options?: RequestInit): Promise<Lecture[] | null> {
  return requeteJson<Lecture[]>(chemin, options);
}

export interface FiltresMesures {
  device_id?: string;
  from?: string;
  to?: string;
  limit?: number;
}

function parametrer(filtres: FiltresMesures): string {
  const params = new URLSearchParams();
  if (filtres.device_id) params.set("device_id", filtres.device_id);
  if (filtres.from) params.set("from", filtres.from);
  if (filtres.to) params.set("to", filtres.to);
  if (filtres.limit) params.set("limit", String(filtres.limit));
  const chaine = params.toString();
  return chaine ? `?${chaine}` : "";
}

export function obtenirCapteurs(): Promise<Lecture[] | null> {
  return requeteApi("/api/capteurs");
}

export function obtenirMesures(
  filtres: FiltresMesures = {}
): Promise<Lecture[] | null> {
  return requeteApi(`/api/mesures${parametrer(filtres)}`);
}

export function estPresenceActive(presence: PresenceValeur | null): boolean {
  return presence === "OUI";
}

export interface ConfigAlerteApi {
  email?: string;
  sms?: string;
  temp_min?: number;
  temp_max?: number;
  gaz_max?: number;
}

export interface ResultatEnvoi {
  canal: "sms" | "email";
  statut: "envoye" | "non_configuré" | "erreur";
  destinataire: string;
  erreur?: string;
}

export interface ReponseEnvoi {
  resultats?: ResultatEnvoi[];
  erreur?: string;
}

export interface MoyenneDispositif {
  device_id: string;
  nom: string | null;
  temperature_moyenne: number | null;
  humidite_moyenne: number | null;
  gaz_moyen: number | null;
}

export interface ReponseRapport {
  date?: string;
  dispositifs?: MoyenneDispositif[];
  resultat?: ResultatEnvoi;
  erreur?: string;
}

export interface ReponseConfigAlerte {
  email?: string | null;
  sms?: string | null;
  temp_min?: number | null;
  temp_max?: number | null;
  gaz_max?: number | null;
  erreur?: string;
}

export function envoyerAlerte(params: {
  message: string;
  sujet?: string;
  sms?: string;
  email?: string;
}): Promise<ReponseEnvoi | null> {
  return requeteJson<ReponseEnvoi>("/api/envoi", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function obtenirRapportQuotidien(): Promise<ReponseRapport | null> {
  return requeteJson<ReponseRapport>("/api/rapport-quotidien");
}

export function envoyerRapportQuotidien(
  email?: string
): Promise<ReponseRapport | null> {
  return requeteJson<ReponseRapport>("/api/rapport-quotidien", {
    method: "POST",
    body: JSON.stringify(email ? { email } : {}),
  });
}

export function mettreAJourNomDispositif(
  deviceId: string,
  nom: string
): Promise<unknown | null> {
  return requeteJson(`/api/dispositifs/${encodeURIComponent(deviceId)}`, {
    method: "PUT",
    body: JSON.stringify({ nom }),
  });
}

export function obtenirConfigAlerte(): Promise<ReponseConfigAlerte | null> {
  return requeteJson<ReponseConfigAlerte>("/api/alert-config");
}

export function mettreAJourConfigAlerte(
  config: ConfigAlerteApi
): Promise<ReponseConfigAlerte | null> {
  return requeteJson<ReponseConfigAlerte>("/api/alert-config", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}
