export type Presence = "OUI" | "NON";

export interface SaisieMesure {
  device_id: string;
  nom?: string;
  temperature?: number;
  humidite?: number;
  gaz_pourcent?: number;
  presence?: Presence;
}

export type ResultatValidation<T> =
  | { ok: true; donnees: T }
  | { ok: false; erreur: string };

function estNombre(valeur: unknown): valeur is number {
  return typeof valeur === "number" && Number.isFinite(valeur);
}

export function validerMesure(corps: unknown): ResultatValidation<SaisieMesure> {
  if (typeof corps !== "object" || corps === null || Array.isArray(corps)) {
    return { ok: false, erreur: "Corps de requête invalide." };
  }

  const brut = corps as Record<string, unknown>;

  if (typeof brut.device_id !== "string" || !brut.device_id.trim()) {
    return { ok: false, erreur: "device_id est requis." };
  }
  const deviceId = brut.device_id.trim();
  if (deviceId.length > 50) {
    return { ok: false, erreur: "device_id ne doit pas dépasser 50 caractères." };
  }

  let nom: string | undefined;
  if (brut.nom !== undefined && brut.nom !== null) {
    if (typeof brut.nom !== "string") {
      return { ok: false, erreur: "nom doit être une chaîne de caractères." };
    }
    const nomNet = brut.nom.trim();
    if (nomNet.length > 50) {
      return { ok: false, erreur: "nom ne doit pas dépasser 50 caractères." };
    }
    nom = nomNet;
  }

  let temperature: number | undefined;
  if (brut.temperature !== undefined && brut.temperature !== null) {
    if (!estNombre(brut.temperature)) {
      return { ok: false, erreur: "temperature doit être un nombre." };
    }
    temperature = brut.temperature;
  }

  let humidite: number | undefined;
  if (brut.humidite !== undefined && brut.humidite !== null) {
    if (!estNombre(brut.humidite)) {
      return { ok: false, erreur: "humidite doit être un nombre." };
    }
    humidite = brut.humidite;
  }

  let gazPourcent: number | undefined;
  if (brut.gaz_pourcent !== undefined && brut.gaz_pourcent !== null) {
    if (!Number.isInteger(brut.gaz_pourcent)) {
      return { ok: false, erreur: "gaz_pourcent doit être un entier." };
    }
    gazPourcent = brut.gaz_pourcent as number;
  }

  let presence: Presence | undefined;
  if (brut.presence !== undefined && brut.presence !== null) {
    if (typeof brut.presence !== "string") {
      return { ok: false, erreur: "presence doit être une chaîne." };
    }
    const presenceNet = brut.presence.trim().toUpperCase();
    if (presenceNet !== "OUI" && presenceNet !== "NON") {
      return { ok: false, erreur: "presence doit valoir OUI ou NON." };
    }
    presence = presenceNet;
  }

  if (
    temperature === undefined &&
    humidite === undefined &&
    gazPourcent === undefined &&
    presence === undefined
  ) {
    return {
      ok: false,
      erreur:
        "Aucune mesure fournie. Préciser au moins l'un de : temperature, humidite, gaz_pourcent, presence.",
    };
  }

  return {
    ok: true,
    donnees: {
      device_id: deviceId,
      nom,
      temperature,
      humidite,
      gaz_pourcent: gazPourcent,
      presence,
    },
  };
}

export interface SaisieConfigAlerte {
  email?: string;
  sms?: string;
  temp_min?: number;
  temp_max?: number;
  hum_min?: number;
  hum_max?: number;
  gaz_max?: number;
}

export function validerConfigAlerte(
  corps: unknown
): ResultatValidation<SaisieConfigAlerte> {
  if (typeof corps !== "object" || corps === null || Array.isArray(corps)) {
    return { ok: false, erreur: "Corps de requête invalide." };
  }

  const brut = corps as Record<string, unknown>;
  const sortie: SaisieConfigAlerte = {};

  if (brut.email !== undefined) {
    if (typeof brut.email !== "string") {
      return { ok: false, erreur: "email doit être une chaîne." };
    }
    sortie.email = brut.email.trim();
  }
  if (brut.sms !== undefined) {
    if (typeof brut.sms !== "string") {
      return { ok: false, erreur: "sms doit être une chaîne." };
    }
    sortie.sms = brut.sms.trim();
  }
  if (brut.temp_min !== undefined) {
    if (!estNombre(brut.temp_min)) {
      return { ok: false, erreur: "temp_min doit être un nombre." };
    }
    sortie.temp_min = brut.temp_min;
  }
  if (brut.temp_max !== undefined) {
    if (!estNombre(brut.temp_max)) {
      return { ok: false, erreur: "temp_max doit être un nombre." };
    }
    sortie.temp_max = brut.temp_max;
  }
  if (brut.hum_min !== undefined) {
    if (!estNombre(brut.hum_min)) {
      return { ok: false, erreur: "hum_min doit être un nombre." };
    }
    sortie.hum_min = brut.hum_min;
  }
  if (brut.hum_max !== undefined) {
    if (!estNombre(brut.hum_max)) {
      return { ok: false, erreur: "hum_max doit être un nombre." };
    }
    sortie.hum_max = brut.hum_max;
  }
  if (brut.gaz_max !== undefined) {
    if (!Number.isInteger(brut.gaz_max)) {
      return { ok: false, erreur: "gaz_max doit être un entier." };
    }
    sortie.gaz_max = brut.gaz_max as number;
  }

  if (Object.keys(sortie).length === 0) {
    return {
      ok: false,
      erreur: "Aucun champ fourni à mettre à jour.",
    };
  }

  return { ok: true, donnees: sortie };
}
