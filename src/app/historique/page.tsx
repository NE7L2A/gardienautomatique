"use client";

import { useState } from "react";
import Header from "@/components/ui/Header";
import Navigation from "@/components/ui/Navigation";
import Carte from "@/components/ui/Carte";
import IconeCapteur from "@/components/ui/IconeCapteur";
import { historiqueEvenements } from "@/lib/mock-data";
import type { TypeCapteur } from "@/types";

const filtresType: { valeur: TypeCapteur | "tous"; label: string }[] = [
  { valeur: "tous", label: "Tous" },
  { valeur: "presence", label: "Présence" },
  { valeur: "temperature", label: "Température" },
  { valeur: "humidite", label: "Humidité" },
  { valeur: "gaz", label: "Gaz" },
  { valeur: "flamme", label: "Flamme" },
];

export default function HistoriquePage() {
  const [filtreType, setFiltreType] = useState<TypeCapteur | "tous">("tous");

  const evenementsFiltres = historiqueEvenements.filter((e) => {
    if (filtreType !== "tous" && e.type !== filtreType) return false;
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

        <p className="text-[#64748B] text-xs">
          {evenementsFiltres.length} événement(s) trouvé(s)
        </p>

        <div className="space-y-2">
          {evenementsFiltres.map((evt) => (
            <Carte key={evt.id}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#243447] text-[#94A3B8] flex items-center justify-center shrink-0">
                  <IconeCapteur type={evt.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold mb-0.5">
                    {evt.titre}
                  </p>
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
