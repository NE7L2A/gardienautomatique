import type {
  Capteur,
  Alerte,
  ParametresAlerte,
  ContactNotification,
  CanalAlerte,
  NiveauAlerte,
  TypeCapteur,
  SeuilsCapteur,
} from "@/types";

let compteurAlertes = 100;

function genererIdAlerte(): string {
  compteurAlertes++;
  return `alt-${String(compteurAlertes).padStart(3, "0")}`;
}

export function evaluerCapteur(
  capteur: Capteur,
  parametres: ParametresAlerte,
  seuils?: SeuilsCapteur | null
): Alerte | null {
  if (capteur.type === "temperature" && typeof capteur.valeur === "number") {
    const max = seuils?.temperatureMax ?? parametres.seuilTemperatureCritique;
    const min = seuils?.temperatureMin ?? parametres.seuilTemperatureCritique - 4;
    if (capteur.valeur >= max) {
      return {
        id: genererIdAlerte(),
        type: "temperature",
        niveau: "danger",
        canal: parametres.canalTemperature,
        message: `Température critique : ${capteur.valeur}°C à ${capteur.salle} (seuil : ${max}°C)`,
        timestamp: new Date().toISOString(),
        lue: false,
        envoyee: false,
      };
    }
    if (capteur.valeur >= max - 2 || capteur.valeur <= min) {
      return {
        id: genererIdAlerte(),
        type: "temperature",
        niveau: "warning",
        canal: parametres.canalTemperature,
        message: `Température ${capteur.valeur <= min ? "basse" : "élevée"} : ${capteur.valeur}°C à ${capteur.salle}`,
        timestamp: new Date().toISOString(),
        lue: false,
        envoyee: false,
      };
    }
  }

  if (capteur.type === "humidite" && typeof capteur.valeur === "number") {
    const max = seuils?.humiditeMax ?? 80;
    const min = seuils?.humiditeMin ?? 20;
    if (capteur.valeur >= max || capteur.valeur <= min) {
      return {
        id: genererIdAlerte(),
        type: "humidite",
        niveau: "warning",
        canal: "push",
        message: `Humidité ${capteur.valeur >= max ? "élevée" : "basse"} : ${capteur.valeur}% à ${capteur.salle}`,
        timestamp: new Date().toISOString(),
        lue: false,
        envoyee: false,
      };
    }
  }

  if (capteur.type === "gaz" && typeof capteur.valeur === "number") {
    const max = seuils?.gazMax ?? 80;
    if (capteur.valeur >= max) {
      return {
        id: genererIdAlerte(),
        type: "gaz",
        niveau: capteur.valeur >= max + 20 ? "danger" : "warning",
        canal: "sms",
        message: `Gaz ${capteur.valeur >= max + 20 ? "critique" : "élevé"} : ${capteur.valeur} ppm à ${capteur.salle}`,
        timestamp: new Date().toISOString(),
        lue: false,
        envoyee: false,
      };
    }
  }

  if (capteur.type === "flamme" && parametres.detectionFlamme) {
    if (capteur.valeur === "Danger" || capteur.etat === "danger") {
      return {
        id: genererIdAlerte(),
        type: "flamme",
        niveau: "danger",
        canal: parametres.canalFlamme,
        message: `Flamme détectée à ${capteur.salle} — action immédiate requise`,
        timestamp: new Date().toISOString(),
        lue: false,
        envoyee: false,
      };
    }
  }

  if (capteur.type === "presence" && capteur.etat === "danger") {
    return {
      id: genererIdAlerte(),
      type: "presence",
      niveau: "danger",
      canal: parametres.canalPresence,
      message: `Intrusion détectée à ${capteur.salle}`,
      timestamp: new Date().toISOString(),
      lue: false,
      envoyee: false,
    };
  }

  return null;
}

export function evaluerTousLesCapteurs(
  capteurs: Capteur[],
  parametres: ParametresAlerte,
  tousSeuils?: SeuilsCapteur[]
): Alerte[] {
  const alertes: Alerte[] = [];
  for (const capteur of capteurs) {
    const seuil = tousSeuils?.find((s) => s.capteurId === capteur.id);
    const alerte = evaluerCapteur(capteur, parametres, seuil);
    if (alerte) {
      alertes.push(alerte);
    }
  }
  return alertes;
}

export function determinerCanal(
  type: TypeCapteur,
  niveau: NiveauAlerte,
  parametres: ParametresAlerte,
  contact: ContactNotification
): { canal: CanalAlerte; destinataire: string } | null {
  if (niveau === "danger") {
    if ((type === "flamme" || type === "gaz") && contact.telephone) {
      return { canal: "sms", destinataire: contact.telephone };
    }
    if (type === "presence" && contact.telephone) {
      return { canal: "sms", destinataire: contact.telephone };
    }
    if (type === "temperature" && contact.telephone) {
      return { canal: "sms", destinataire: contact.telephone };
    }
  }

  if (type === "temperature" && contact.email) {
    return { canal: "email", destinataire: contact.email };
  }

  if (type === "humidite" && contact.email) {
    return { canal: "email", destinataire: contact.email };
  }

  if (contact.email) {
    return { canal: "email", destinataire: contact.email };
  }

  return null;
}

export function simulerEnvoi(alerte: Alerte, destinataire: string): string {
  const canauxLabel: Record<CanalAlerte, string> = {
    sms: "SMS",
    email: "Email",
    push: "Push",
  };
  return `[${canauxLabel[alerte.canal]}] Alerte ${alerte.niveau} — ${alerte.message} → ${destinataire}`;
}
