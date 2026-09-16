import { jsPDF } from "jspdf";
import type { Lecture, ConfigAlertes } from "@/types";

export interface StatCapteur {
  min: number;
  max: number;
  moyenne: number;
}

export interface StatsRapport {
  date: string;
  capteurs: {
    temperature: StatCapteur | null;
    humidite: StatCapteur | null;
    gaz: StatCapteur | null;
  };
  presence: { nombreDetections: number };
  evenements: { total: number; parType: Record<string, number> };
}

function calculerStat(valeurs: number[]): StatCapteur | null {
  if (valeurs.length === 0) return null;
  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  const moyenne = valeurs.reduce((s, v) => s + v, 0) / valeurs.length;
  return {
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    moyenne: Math.round(moyenne * 10) / 10,
  };
}

export function calculerStats(
  lectures: Lecture[],
  config: ConfigAlertes
): StatsRapport {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const temperatures: number[] = [];
  const humidites: number[] = [];
  const gazValues: number[] = [];
  let presences = 0;

  const evenementsParType: Record<string, number> = {};
  let totalEvenements = 0;

  const tempMax = config.temp_max ?? 28;
  const humMax = config.hum_max ?? 80;
  const humMin = config.hum_min ?? 20;
  const gazMax = config.gaz_max ?? 60;

  for (const l of lectures) {
    if (l.temperature !== null && l.temperature !== undefined) {
      temperatures.push(l.temperature);
      if (l.temperature > tempMax) {
        evenementsParType.temperature = (evenementsParType.temperature ?? 0) + 1;
        totalEvenements++;
      }
    }
    if (l.humidite !== null && l.humidite !== undefined) {
      humidites.push(l.humidite);
      if (l.humidite > humMax || l.humidite < humMin) {
        evenementsParType.humidite = (evenementsParType.humidite ?? 0) + 1;
        totalEvenements++;
      }
    }
    if (l.gaz_pourcent !== null && l.gaz_pourcent !== undefined) {
      gazValues.push(l.gaz_pourcent);
      if (l.gaz_pourcent > gazMax) {
        evenementsParType.gaz = (evenementsParType.gaz ?? 0) + 1;
        totalEvenements++;
      }
    }
    if (l.presence === "OUI") {
      presences++;
    }
  }

  return {
    date: dateStr,
    capteurs: {
      temperature: calculerStat(temperatures),
      humidite: calculerStat(humidites),
      gaz: calculerStat(gazValues),
    },
    presence: { nombreDetections: presences },
    evenements: { total: totalEvenements, parType: evenementsParType },
  };
}

const libelleType: Record<string, string> = {
  temperature: "Temperature",
  humidite: "Humidite",
  gaz: "Gaz",
};

export function genererPDF(stats: StatsRapport): jsPDF {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("EYESHOME - Rapport Journalier", 20, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Date : ${stats.date}`, 20, y);
  y += 4;

  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("CAPTEURS", 20, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Type", 20, y);
  doc.text("Min", 80, y);
  doc.text("Max", 115, y);
  doc.text("Moy", 150, y);
  y += 6;

  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  const types: Array<{ key: keyof typeof stats.capteurs; unite: string }> = [
    { key: "temperature", unite: " C" },
    { key: "humidite", unite: "%" },
    { key: "gaz", unite: "%" },
  ];

  for (const t of types) {
    const s = stats.capteurs[t.key];
    doc.text(libelleType[t.key] ?? t.key, 20, y);
    doc.text(s ? `${s.min}${t.unite}` : "\u2014", 80, y);
    doc.text(s ? `${s.max}${t.unite}` : "\u2014", 115, y);
    doc.text(s ? `${s.moyenne}${t.unite}` : "\u2014", 150, y);
    y += 6;
  }

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PRESENCE", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Nombre de detections : ${stats.presence.nombreDetections}`, 20, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("EVENEMENTS", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Total des alertes : ${stats.evenements.total}`, 20, y);
  y += 6;

  for (const [type, nb] of Object.entries(stats.evenements.parType)) {
    doc.text(`- ${libelleType[type] ?? type} : ${nb}`, 28, y);
    y += 5;
  }

  if (stats.evenements.total === 0) {
    doc.text("Aucune alerte declenchee.", 28, y);
  }

  return doc;
}
