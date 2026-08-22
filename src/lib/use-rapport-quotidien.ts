"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { obtenirMesures, obtenirConfigAlertes, envoyerEmail } from "@/lib/api";
import { getParametresNotification } from "@/lib/store";
import { calculerStats, genererPDF, type StatsRapport } from "@/lib/rapport";

function aujourdHui(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useRapportQuotidien(): {
  stats: StatsRapport | null;
  generer: () => Promise<void>;
} {
  const [stats, setStats] = useState<StatsRapport | null>(null);
  const statsRef = useRef<StatsRapport | null>(null);

  const generer = useCallback(async () => {
    const debut = new Date();
    debut.setHours(0, 0, 0, 0);
    const fin = new Date();

    const [lectures, config] = await Promise.all([
      obtenirMesures({
        from: debut.toISOString(),
        to: fin.toISOString(),
        limit: 5000,
      }),
      obtenirConfigAlertes(),
    ]);

    if (!lectures || !config) return;

    const resultat = calculerStats(lectures, config);
    statsRef.current = resultat;
    setStats(resultat);

    const rapportActif = getParametresNotification().rapportsQuotidiens;
    if (navigator.onLine && rapportActif && config.email) {
      const doc = genererPDF(resultat);
      const base64 = doc.output("datauristring").split(",")[1];
      await envoyerEmail({
        email: config.email,
        titre: `Rapport EyesHome \u2014 ${resultat.date}`,
        message: `Veuillez trouver en pi\u00e8ce jointe, le rapport journalier du ${resultat.date}.`,
        attachment: base64,
      });
    }

    try {
      localStorage.setItem("rapport_date", aujourdHui());
    } catch {}
  }, []);

  useEffect(() => {
    const dejaFait = localStorage.getItem("rapport_date") === aujourdHui();
    if (!dejaFait) {
      generer();
    } else {
      const debut = new Date();
      debut.setHours(0, 0, 0, 0);
      obtenirMesures({
        from: debut.toISOString(),
        to: new Date().toISOString(),
        limit: 5000,
      }).then((lectures) => {
        obtenirConfigAlertes().then((config) => {
          if (lectures && config) {
            const resultat = calculerStats(lectures, config);
            statsRef.current = resultat;
            setStats(resultat);
          }
        });
      });
    }

    const interval = setInterval(() => {
      const dateActuelle = aujourdHui();
      const derniereDate = localStorage.getItem("rapport_date");
      if (derniereDate !== dateActuelle) {
        generer();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [generer]);

  return { stats, generer };
}
