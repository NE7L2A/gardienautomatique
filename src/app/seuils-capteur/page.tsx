"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Bouton from "@/components/ui/Bouton";
import Carte from "@/components/ui/Carte";
import {
  obtenirConfigAlertes,
  sauvegarderConfigAlertes,
} from "@/lib/api";

export default function SeuilsCapteurPage() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState("");

  const [temperatureMin, setTemperatureMin] = useState("18");
  const [temperatureMax, setTemperatureMax] = useState("28");
  const [humiditeMin, setHumiditeMin] = useState("20");
  const [humiditeMax, setHumiditeMax] = useState("80");
  const [gazMax, setGazMax] = useState("60");

  useEffect(() => {
    let annule = false;
    obtenirConfigAlertes().then((config) => {
      if (annule) return;
      if (config) {
        if (config.temp_min !== null && config.temp_min !== undefined) {
          setTemperatureMin(String(config.temp_min));
        }
        if (config.temp_max !== null && config.temp_max !== undefined) {
          setTemperatureMax(String(config.temp_max));
        }
        if (config.hum_min !== null && config.hum_min !== undefined) {
          setHumiditeMin(String(config.hum_min));
        }
        if (config.hum_max !== null && config.hum_max !== undefined) {
          setHumiditeMax(String(config.hum_max));
        }
        if (config.gaz_max !== null && config.gaz_max !== undefined) {
          setGazMax(String(config.gaz_max));
        }
      }
      setChargement(false);
    });
    return () => { annule = true; };
  }, []);

  const sauvegarder = async () => {
    setErreur("");
    const config = {
      temp_min: parseFloat(temperatureMin) || undefined,
      temp_max: parseFloat(temperatureMax) || undefined,
      hum_min: parseFloat(humiditeMin) || undefined,
      hum_max: parseFloat(humiditeMax) || undefined,
      gaz_max: Math.round(parseFloat(gazMax) || 0) || undefined,
    };
    const resultat = await sauvegarderConfigAlertes(config);
    if (!resultat) {
      setErreur("Impossible d'enregistrer les seuils (backend injoignable).");
      return;
    }
    setSucces(true);
    setTimeout(() => router.push("/"), 1500);
  };

  const champ = (label: string, valeur: string, setter: (v: string) => void) => (
    <div>
      <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
        {label}
      </label>
      <input
        type="number"
        value={valeur}
        onChange={(e) => setter(e.target.value)}
        className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header titre="Seuils d'alerte" sousTitre="Configuration des seuils" />
      <main className="px-5 py-5 space-y-5">
        {chargement ? (
          <p className="text-[#94A3B8] text-center">Chargement...</p>
        ) : succes ? (
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
            <section>
              <h2 className="text-white font-bold text-base mb-3">Température</h2>
              <Carte>
                <div className="space-y-4">
                  {champ("Seuil minimum (°C)", temperatureMin, setTemperatureMin)}
                  {champ("Seuil maximum (°C)", temperatureMax, setTemperatureMax)}
                </div>
              </Carte>
            </section>
            <section>
              <h2 className="text-white font-bold text-base mb-3">Humidité</h2>
              <Carte>
                <div className="space-y-4">
                  {champ("Seuil minimum (%)", humiditeMin, setHumiditeMin)}
                  {champ("Seuil maximum (%)", humiditeMax, setHumiditeMax)}
                </div>
              </Carte>
            </section>
            <section>
              <h2 className="text-white font-bold text-base mb-3">Gaz</h2>
              <Carte>
                {champ("Seuil maximum (%)", gazMax, setGazMax)}
              </Carte>
            </section>

            <div className="bg-[#2979FF]/8 border border-[#2979FF]/15 rounded-xl p-3">
              <p className="text-[#2979FF] text-xs text-center leading-relaxed">
                Ces seuils s&apos;appliquent à tous les capteurs (configuration
                globale, stockée en base de données).
              </p>
            </div>

            {erreur && (
              <p className="text-[#FF1744] text-sm text-center bg-[#FF1744]/10 py-2 rounded-lg">
                {erreur}
              </p>
            )}

            <div className="space-y-3 pt-2">
              <Bouton onClick={sauvegarder}>Enregistrer les seuils</Bouton>
              <button
                onClick={() => router.push("/")}
                className="w-full text-center text-[#94A3B8] text-sm font-medium py-2"
              >
                Annuler
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
