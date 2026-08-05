import type {
  Salle,
  Capteur,
  Alerte,
  EvenementHistorique,
  ParametresNotification,
  ParametresSMS,
  ParametresAlerte,
  PointTemperature,
  PointHumidite,
  PointGaz,
  EtatSalle,
} from "@/types";

const MAINTENANT = new Date();

export const libelleTypeCapteur: Record<string, string> = {
  temperature: "Température",
  presence: "Présence",
  flamme: "Flamme",
  humidite: "Humidité",
  gaz: "Gaz",
};

function h(hoursAgo: number): Date {
  return new Date(MAINTENANT.getTime() - hoursAgo * 60 * 60 * 1000);
}

export const sallesDefaut: Salle[] = [
  {
    id: "salle-test",
    nom: "Salle Test",
    capteurs: [
      {
        id: "capteur_00",
        nom: "Salle Test — Température",
        type: "temperature",
        valeur: 24.5,
        unite: "°C",
        etat: "normal",
        salle: "Salle Test",
        derniereMiseAJour: MAINTENANT.toISOString(),
      },
      {
        id: "capteur_00_hum",
        nom: "Salle Test — Humidité",
        type: "humidite",
        valeur: 55,
        unite: "%",
        etat: "normal",
        salle: "Salle Test",
        derniereMiseAJour: MAINTENANT.toISOString(),
      },
      {
        id: "capteur_00_gaz",
        nom: "Salle Test — Gaz",
        type: "gaz",
        valeur: 42,
        unite: "%",
        etat: "normal",
        salle: "Salle Test",
        derniereMiseAJour: MAINTENANT.toISOString(),
      },
      {
        id: "capteur_00_pres",
        nom: "Salle Test — Présence",
        type: "presence",
        valeur: "Sécurisé",
        unite: "",
        etat: "normal",
        salle: "Salle Test",
        derniereMiseAJour: MAINTENANT.toISOString(),
      },
    ],
  },
];

export function tousLesCapteurs(salles: Salle[]): Capteur[] {
  return salles.flatMap((s) => s.capteurs);
}

export function genererHistoriqueTemperature(
  seed = 0,
  nomSalle = "Salle Test"
): PointTemperature[] {
  const points: PointTemperature[] = [];
  for (let i = 24; i >= 0; i--) {
    const heure = h(i);
    const label = heure.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const base = 23 + Math.sin(i / 3) * 3 + seed * 1.8;
    points.push({
      heure: label,
      temperature: Math.round((base + (Math.random() - 0.5) * 0.8) * 10) / 10,
      salle: nomSalle,
    });
  }
  return points;
}

export function etatsSalles(salles: Salle[]): EtatSalle[] {
  return salles.map((s) => {
    const tempCapteur = s.capteurs.find((c) => c.type === "temperature");
    const temperature =
      typeof tempCapteur?.valeur === "number" ? tempCapteur.valeur : 0;
    const alertes = s.capteurs.filter(
      (c) => c.etat === "alerte" || c.etat === "danger"
    ).length;
    return {
      salle: s.nom,
      temperature,
      alertes,
      capteurs: s.capteurs.length,
    };
  });
}

export const alertesRecentes: Alerte[] = [
  {
    id: "alt-001",
    type: "presence",
    niveau: "warning",
    canal: "push",
    message: "Mouvement détecté — Salle Test. À vérifier.",
    timestamp: h(1).toISOString(),
    lue: false,
    envoyee: true,
  },
  {
    id: "alt-002",
    type: "temperature",
    niveau: "info",
    canal: "email",
    message: "Température maximale atteinte : 28°C — Salle Test.",
    timestamp: h(2).toISOString(),
    lue: true,
    envoyee: true,
  },
];

export const historiqueEvenements: EvenementHistorique[] = [
  {
    id: "hist-001",
    type: "presence",
    niveau: "danger",
    titre: "Intrusion détectée",
    description: "Mouvement persistant détecté dans Salle Test pendant 30 secondes",
    timestamp: h(0.5).toISOString(),
  },
  {
    id: "hist-002",
    type: "temperature",
    niveau: "warning",
    titre: "Température élevée",
    description: "La température de Salle Test a atteint 28°C (seuil : 27°C)",
    timestamp: h(1).toISOString(),
  },
  {
    id: "hist-003",
    type: "presence",
    niveau: "warning",
    titre: "Mouvement détecté",
    description: "Brève détection de mouvement dans Salle Test — vérifié, aucun intrus",
    timestamp: h(4).toISOString(),
  },
  {
    id: "hist-004",
    type: "temperature",
    niveau: "info",
    titre: "Température normale",
    description: "Température de Salle Test revenue à 24°C",
    timestamp: h(3).toISOString(),
  },
  {
    id: "hist-005",
    type: "gaz",
    niveau: "info",
    titre: "Gaz normal",
    description: "Concentration de gaz stable à 45 ppm",
    timestamp: h(2).toISOString(),
  },
  {
    id: "hist-006",
    type: "humidite",
    niveau: "warning",
    titre: "Humidité excessive",
    description: "Taux d'humidité à 82% — risque de condensation",
    timestamp: h(5).toISOString(),
  },
  {
    id: "hist-007",
    type: "presence",
    niveau: "info",
    titre: "Système armé",
    description: "Le système de surveillance a été activé manuellement",
    timestamp: h(7).toISOString(),
  },
  {
    id: "hist-008",
    type: "temperature",
    niveau: "warning",
    titre: "Température en hausse",
    description: "Température en hausse progressive : 25°C → 26.5°C",
    timestamp: h(6).toISOString(),
  },
];

export const parametresNotificationDefaut: ParametresNotification = {
  activees: false,
  presences: true,
  temperatures: true,
  gaz: true,
  humidites: true,
  rapportsQuotidiens: false,
  email: "",
};

export const parametresSMSDefaut: ParametresSMS = {
  active: false,
  numeroTelephone: "",
  alertesPresence: true,
  toutesLesAlertes: false,
  urgenceUniquement: true,
};

export const parametresAlerteDefaut: ParametresAlerte = {
  seuilTemperatureCritique: 28,
  detectionFlamme: true,
  frequence: "immediat",
  canalFlamme: "sms",
  canalTemperature: "push",
  canalPresence: "push",
};

export function genererHistoriqueHumidite(
  seed = 0,
  nomSalle = "Salle Test"
): PointHumidite[] {
  const points: PointHumidite[] = [];
  for (let i = 24; i >= 0; i--) {
    const heure = h(i);
    const label = heure.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const base = 50 + Math.sin(i / 4) * 8 + seed * 4;
    points.push({ heure: label, humidite: Math.round((base + (Math.random() - 0.5) * 3) * 10) / 10, salle: nomSalle });
  }
  return points;
}

export function genererHistoriqueGaz(
  seed = 0,
  nomSalle = "Salle Test"
): PointGaz[] {
  const points: PointGaz[] = [];
  for (let i = 24; i >= 0; i--) {
    const heure = h(i);
    const label = heure.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const base = 40 + Math.sin(i / 2) * 6 + seed * 3;
    points.push({ heure: label, gaz: Math.round((base + (Math.random() - 0.5) * 4) * 10) / 10, salle: nomSalle });
  }
  return points;
}

export function genererPresenceQuotidienne(
  heures = 24
): { heure: string; actif: boolean }[] {
  const points: { heure: string; actif: boolean }[] = [];
  const total = Math.max(1, heures * 30);
  for (let i = total - 1; i >= 0; i--) {
    const heure = new Date(MAINTENANT.getTime() - i * 3 * 60 * 1000);
    const label = heure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const hh = heure.getHours();
    const actif = hh >= 8 && hh <= 20 ? Math.random() > 0.7 : Math.random() > 0.95;
    points.push({ heure: label, actif });
  }
  return points;
}
