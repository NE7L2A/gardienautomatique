"use client";

import { useState } from "react";
import Header from "@/components/ui/Header";
import Navigation from "@/components/ui/Navigation";
import Carte from "@/components/ui/Carte";
import { historiqueEvenements } from "@/lib/mock-data";
import type { TypeCapteur, NiveauAlerte } from "@/types";

const filtresType: { valeur: TypeCapteur | "tous"; label: string }[] = [
  { valeur: "tous", label: "Tous" },
  { valeur: "presence", label: "Présence" },
  { valeur: "temperature", label: "Température" },
  { valeur: "humidite", label: "Humidité" },
  { valeur: "gaz", label: "Gaz" },
  { valeur: "flamme", label: "Flamme" },
];

const filtresNiveau: { valeur: NiveauAlerte | "tous"; label: string }[] = [
  { valeur: "tous", label: "Tous" },
  { valeur: "danger", label: "Danger" },
  { valeur: "warning", label: "Attention" },
  { valeur: "info", label: "Info" },
];

function IconeType({ type }: { type: TypeCapteur }) {
  const classes = "w-5 h-5";
  if (type === "presence")
    return (
      <svg className={classes} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  if (type === "flamme")
    return (
      <svg className={classes} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    );
  if (type === "humidite")
    return (
      <svg className={classes} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-5-5-11-5-11z" />
      </svg>
    );
  if (type === "gaz")
    return (
      <svg className={classes} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h1m8-9v1m8 8h1M5.64 5.64l.7.7M18.36 5.64l-.7.7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8a5 5 0 00-5 5v1a5 5 0 0010 0v-1a5 5 0 00-5-5z" />
      </svg>
    );
  return (
    <svg className={classes} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

const bordureNiveau: Record<NiveauAlerte, string> = {
  info: "border-l-[#00C853]",
  warning: "border-l-[#FF9900]",
  danger: "border-l-[#FF1744]",
};

const badgeNiveau: Record<NiveauAlerte, string> = {
  info: "bg-[#00C853]/15 text-[#00C853]",
  warning: "bg-[#FF9900]/15 text-[#FF9900]",
  danger: "bg-[#FF1744]/15 text-[#FF1744]",
};

export default function HistoriquePage() {
  const [filtreType, setFiltreType] = useState<TypeCapteur | "tous">("tous");
  const [filtreNiveau, setFiltreNiveau] = useState<NiveauAlerte | "tous">(
    "tous"
  );

  const evenementsFiltres = historiqueEvenements.filter((e) => {
    if (filtreType !== "tous" && e.type !== filtreType) return false;
    if (filtreNiveau !== "tous" && e.niveau !== filtreNiveau) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header titre="Historique" sousTitre="Tous les événements" />

      <main className="px-5 py-5 space-y-5">
        <section>
          <h3 className="text-[#64748B] text-xs font-medium mb-2 uppercase tracking-wider">
            Filtrer par type
          </h3>
          <div className="flex gap-2 flex-wrap">
            {filtresType.map((f) => (
              <button
                key={f.valeur}
                onClick={() => setFiltreType(f.valeur)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    filtreType === f.valeur
                      ? "bg-[#FF9900] text-[#232F3E] font-bold"
                      : "bg-[#243447] text-[#94A3B8] border border-[#334155] hover:border-[#FF9900]/30"
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[#64748B] text-xs font-medium mb-2 uppercase tracking-wider">
            Filtrer par niveau
          </h3>
          <div className="flex gap-2 flex-wrap">
            {filtresNiveau.map((f) => (
              <button
                key={f.valeur}
                onClick={() => setFiltreNiveau(f.valeur)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    filtreNiveau === f.valeur
                      ? "bg-[#FF9900] text-[#232F3E] font-bold"
                      : "bg-[#243447] text-[#94A3B8] border border-[#334155] hover:border-[#FF9900]/30"
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <p className="text-[#64748B] text-xs">
          {evenementsFiltres.length} événement(s) trouvé(s)
        </p>

        <div className="space-y-2">
          {evenementsFiltres.map((evt) => (
            <Carte
              key={evt.id}
              className={`border-l-4 ${bordureNiveau[evt.niveau]}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${badgeNiveau[evt.niveau]}`}
                >
                  <IconeType type={evt.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white text-sm font-semibold">
                      {evt.titre}
                    </p>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeNiveau[evt.niveau]}`}
                    >
                      {evt.niveau === "info" && "Info"}
                      {evt.niveau === "warning" && "Attention"}
                      {evt.niveau === "danger" && "Danger"}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">
                    {evt.description}
                  </p>
                  <p className="text-[#64748B] text-[11px] mt-1.5">
                    {new Date(evt.timestamp).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </Carte>
          ))}
        </div>

        {evenementsFiltres.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#64748B] text-sm">
              Aucun événement ne correspond aux filtres
            </p>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
