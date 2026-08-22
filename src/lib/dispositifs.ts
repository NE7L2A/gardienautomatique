import { libelleTypeCapteur } from "./mock-data";
import {
  obtenirDispositifsApi,
  obtenirCapteurs,
  type DispositifData,
} from "./api";
import type { Capteur, Lecture } from "@/types";

export interface Dispositif {
  dev_eui: string;
  nom: string;
  capteurs: Capteur[];
}

function construireCapteursDepuisLecture(
  dev_eui: string,
  nom: string,
  lecture: Lecture | undefined
): Capteur[] {
  const types: Array<{ type: Capteur["type"]; unite: string }> = [
    { type: "temperature", unite: "°C" },
    { type: "humidite", unite: "%" },
    { type: "gaz", unite: "%" },
    { type: "presence", unite: "" },
  ];

  return types.map(({ type, unite }) => {
    let valeur: number | string;
    let etat: Capteur["etat"] = "normal";

    if (type === "temperature" && lecture?.temperature !== null && lecture?.temperature !== undefined) {
      valeur = lecture.temperature;
    } else if (type === "humidite" && lecture?.humidite !== null && lecture?.humidite !== undefined) {
      valeur = lecture.humidite;
    } else if (type === "gaz" && lecture?.gaz_pourcent !== null && lecture?.gaz_pourcent !== undefined) {
      valeur = lecture.gaz_pourcent;
    } else if (type === "presence" && lecture?.presence) {
      valeur = lecture.presence === "OUI" ? "Détecté" : "Sécurisé";
      etat = lecture.presence === "OUI" ? "alerte" : "normal";
    } else {
      valeur = "—";
    }

    const libelle = libelleTypeCapteur[type] ?? type;
    return {
      id: `${dev_eui}_${type}`,
      nom: `${nom} — ${libelle}`,
      type,
      valeur,
      unite,
      etat,
      salle: nom,
      derniereMiseAJour: lecture?.timestamp ?? new Date().toISOString(),
    };
  });
}

export async function chargerDispositifsApi(): Promise<Dispositif[]> {
  const [dispositifsData, lectures] = await Promise.all([
    obtenirDispositifsApi(),
    obtenirCapteurs(),
  ]);

  if (!dispositifsData || dispositifsData.length === 0) return [];

  const lecturesParDevice = new Map<string, Lecture>();
  if (lectures) {
    for (const l of lectures) {
      if (!lecturesParDevice.has(l.device_id)) {
        lecturesParDevice.set(l.device_id, l);
      }
    }
  }

  return dispositifsData.map((d) => {
    const lecture = lecturesParDevice.get(d.dev_eui);
    const nom = d.device_name || d.dev_eui;
    return {
      dev_eui: d.dev_eui,
      nom,
      capteurs: construireCapteursDepuisLecture(d.dev_eui, nom, lecture),
    };
  });
}
