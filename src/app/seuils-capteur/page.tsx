"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/ui/Header";
import Bouton from "@/components/ui/Bouton";
import Carte from "@/components/ui/Carte";
import { getCapteursAjoutes, getSeuilsCapteur, sauvegarderSeuilsCapteur } from "@/lib/store";
import type { SeuilsCapteur, TypeCapteur } from "@/types";

function SeuilsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const capteurTrouve = getCapteursAjoutes().find((c) => c.id === id);
  const seuilsExistants = getSeuilsCapteur(id);

  const type: TypeCapteur = capteurTrouve?.type ?? "temperature";
  const [succes, setSucces] = useState(false);

  const [temperatureMin, setTemperatureMin] = useState(String(seuilsExistants?.temperatureMin ?? 18));
  const [temperatureMax, setTemperatureMax] = useState(String(seuilsExistants?.temperatureMax ?? 28));
  const [humiditeMin, setHumiditeMin] = useState(String(seuilsExistants?.humiditeMin ?? 20));
  const [humiditeMax, setHumiditeMax] = useState(String(seuilsExistants?.humiditeMax ?? 80));
  const [gazMax, setGazMax] = useState(String(seuilsExistants?.gazMax ?? 60));
  const [presenceActive, setPresenceActive] = useState(seuilsExistants?.presenceActive ?? true);
  const [flammeActive, setFlammeActive] = useState(seuilsExistants?.flammeActive ?? true);

  const sauvegarder = () => {
    const seuils: SeuilsCapteur = {
      capteurId: id,
      temperatureMin: parseFloat(temperatureMin) || undefined,
      temperatureMax: parseFloat(temperatureMax) || undefined,
      humiditeMin: parseFloat(humiditeMin) || undefined,
      humiditeMax: parseFloat(humiditeMax) || undefined,
      gazMax: parseFloat(gazMax) || undefined,
      presenceActive,
      flammeActive,
    };
    sauvegarderSeuilsCapteur(seuils);
    setSucces(true);
    setTimeout(() => router.push("/"), 1500);
  };

  const aTemperature = type === "temperature";
  const aHumidite = type === "humidite";
  const aGaz = type === "gaz";
  const aPresence = type === "presence";
  const aFlamme = type === "flamme";

  return (
    <>
      {succes ? (
        <div className="flex flex-col items-center justify-center py-16 animate-fondu">
          <div className="w-20 h-20 rounded-full bg-[#00C853]/15 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white font-bold text-lg">Seuils enregistrés</p>
          <p className="text-[#94A3B8] text-sm mt-1">Redirection...</p>
        </div>
      ) : (
        <>
          {aTemperature && (
            <section>
              <h2 className="text-white font-bold text-base mb-3">Température</h2>
              <Carte>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Seuil minimum (°C)</label>
                    <input type="number" value={temperatureMin} onChange={(e) => setTemperatureMin(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
                  </div>
                  <div>
                    <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Seuil maximum (°C)</label>
                    <input type="number" value={temperatureMax} onChange={(e) => setTemperatureMax(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
                  </div>
                </div>
              </Carte>
            </section>
          )}
          {aHumidite && (
            <section>
              <h2 className="text-white font-bold text-base mb-3">Humidité</h2>
              <Carte>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Seuil minimum (%)</label>
                    <input type="number" value={humiditeMin} onChange={(e) => setHumiditeMin(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
                  </div>
                  <div>
                    <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Seuil maximum (%)</label>
                    <input type="number" value={humiditeMax} onChange={(e) => setHumiditeMax(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
                  </div>
                </div>
              </Carte>
            </section>
          )}
          {aGaz && (
            <section>
              <h2 className="text-white font-bold text-base mb-3">Gaz (%)</h2>
              <Carte>
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Seuil maximum (%)</label>
                <input type="number" value={gazMax} onChange={(e) => setGazMax(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
              </Carte>
            </section>
          )}
          {aPresence && (
            <section>
              <h2 className="text-white font-bold text-base mb-3">Présence</h2>
              <Carte>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={presenceActive} onChange={(e) => setPresenceActive(e.target.checked)} className="w-4 h-4 accent-[#FF9900]" />
                  <span className="text-white text-sm">Détection de présence active</span>
                </label>
              </Carte>
            </section>
          )}
          {aFlamme && (
            <section>
              <h2 className="text-white font-bold text-base mb-3">Flamme</h2>
              <Carte>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={flammeActive} onChange={(e) => setFlammeActive(e.target.checked)} className="w-4 h-4 accent-[#FF9900]" />
                  <span className="text-white text-sm">Détection de flamme active</span>
                </label>
              </Carte>
            </section>
          )}
          <div className="space-y-3 pt-2">
            <Bouton onClick={sauvegarder}>Enregistrer les seuils</Bouton>
            <button onClick={() => router.push("/")} className="w-full text-center text-[#94A3B8] text-sm font-medium py-2">Annuler</button>
          </div>
        </>
      )}
    </>
  );
}

export default function SeuilsCapteurPage() {
  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header titre="Seuils d'alerte" sousTitre="Configuration des seuils" />
      <main className="px-5 py-5 space-y-5">
        <Suspense fallback={<p className="text-[#94A3B8] text-center">Chargement...</p>}>
          <SeuilsForm />
        </Suspense>
      </main>
    </div>
  );
}
