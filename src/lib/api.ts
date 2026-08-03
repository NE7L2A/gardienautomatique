import { API_BASE_URL } from "./config";
import type { Lecture, PresenceValeur, ConfigAlertes } from "@/types";

async function requeteApi<T>(
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
  return requeteApi<Lecture[]>("/api/capteurs");
}

export function obtenirMesures(
  filtres: FiltresMesures = {}
): Promise<Lecture[] | null> {
  return requeteApi<Lecture[]>(`/api/mesures${parametrer(filtres)}`);
}

export function obtenirConfigAlertes(): Promise<ConfigAlertes | null> {
  return requeteApi<ConfigAlertes>("/api/alert-config");
}

export function sauvegarderConfigAlertes(
  config: Partial<ConfigAlertes>
): Promise<ConfigAlertes | null> {
  return requeteApi<ConfigAlertes>("/api/alert-config", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

export interface CorpsEnvoiEmail {
  email?: string;
  titre?: string;
  message?: string;
}

export function envoyerEmail(
  corps: CorpsEnvoiEmail
): Promise<{ statut: string; destinataire?: string } | null> {
  return requeteApi<{ statut: string; destinataire?: string }>(
    "/api/notifications/envoyer",
    {
      method: "POST",
      body: JSON.stringify(corps),
    }
  );
}

export function estPresenceActive(presence: PresenceValeur | null): boolean {
  return presence === "OUI";
}
