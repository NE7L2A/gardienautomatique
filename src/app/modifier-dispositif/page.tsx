"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/ui/Header";
import Bouton from "@/components/ui/Bouton";
import Carte from "@/components/ui/Carte";
import { validerEmail } from "@/lib/validators";
import {
  modifierDispositifApi,
  sauvegarderConfigAlertes,
  obtenirConfigAlertes,
} from "@/lib/api";

interface DonneesModification {
  nom: string;
  temperatureMin: string;
  temperatureMax: string;
  humiditeMin: string;
  humiditeMax: string;
  gazMax: string;
  email: string;
}

const donneesVides: DonneesModification = {
  nom: "",
  temperatureMin: "18",
  temperatureMax: "28",
  humiditeMin: "20",
  humiditeMax: "80",
  gazMax: "60",
  email: "",
};

function Formulaire({ devEui }: { devEui: string }) {
  const router = useRouter();

  const [chargement, setChargement] = useState(true);
  const [donneesInit, setDonneesInit] = useState<DonneesModification>(donneesVides);
  const [nom, setNom] = useState("");
  const [temperatureMin, setTemperatureMin] = useState("18");
  const [temperatureMax, setTemperatureMax] = useState("28");
  const [humiditeMin, setHumiditeMin] = useState("20");
  const [humiditeMax, setHumiditeMax] = useState("80");
  const [gazMax, setGazMax] = useState("60");
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    async function charger() {
      const config = await obtenirConfigAlertes();
      const d: DonneesModification = {
        nom: "",
        temperatureMin: config?.temp_min !== undefined ? String(config.temp_min) : "18",
        temperatureMax: config?.temp_max !== undefined ? String(config.temp_max) : "28",
        humiditeMin: config?.hum_min !== undefined ? String(config.hum_min) : "20",
        humiditeMax: config?.hum_max !== undefined ? String(config.hum_max) : "80",
        gazMax: config?.gaz_max !== undefined ? String(config.gaz_max) : "60",
        email: config?.email ?? "",
      };
      setDonneesInit(d);
      setNom(d.nom);
      setTemperatureMin(d.temperatureMin);
      setTemperatureMax(d.temperatureMax);
      setHumiditeMin(d.humiditeMin);
      setHumiditeMax(d.humiditeMax);
      setGazMax(d.gazMax);
      setEmail(d.email);
      setChargement(false);
    }
    charger();
  }, []);

  if (!devEui) {
    return (
      <div className="text-center space-y-4">
        <p className="text-[#94A3B8] text-center">Aucun dispositif sélectionné</p>
        <button
          onClick={() => router.push("/")}
          className="text-[#FF9900] text-sm font-medium"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  if (chargement) {
    return <p className="text-[#94A3B8] text-center">Chargement...</p>;
  }

  const gererSoumission = async () => {
    setErreur("");

    if (!nom.trim()) {
      setErreur("Donnez un nom à votre dispositif");
      return;
    }
    if (email) {
      const errEmail = validerEmail(email);
      if (errEmail) {
        setErreur(errEmail);
        return;
      }
    }

    const dispositif = await modifierDispositifApi(devEui, nom.trim());
    if (!dispositif) {
      setErreur("Impossible de modifier le dispositif. Vérifiez la connexion au serveur.");
      return;
    }

    const config = await sauvegarderConfigAlertes({
      email,
      temp_min: parseFloat(temperatureMin) || undefined,
      temp_max: parseFloat(temperatureMax) || undefined,
      hum_min: parseFloat(humiditeMin) || undefined,
      hum_max: parseFloat(humiditeMax) || undefined,
      gaz_max: parseFloat(gazMax) || undefined,
    });
    if (!config) {
      setErreur("Impossible d'enregistrer la configuration des alertes.");
      return;
    }

    setSucces(true);
    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <>
      {succes ? (
        <div className="flex flex-col items-center justify-center py-16 animate-fondu">
          <div className="w-20 h-20 rounded-full bg-[#00C853]/15 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white font-bold text-lg">Dispositif modifié</p>
          <p className="text-[#94A3B8] text-sm mt-1">Redirection vers le tableau de bord...</p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-white font-bold text-base mb-3">Identité du dispositif</h2>
            <div className="space-y-3">
              <Carte>
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                  Dev EUI
                </label>
                <p className="text-white text-sm">{devEui}</p>
              </Carte>
              <Carte>
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                  Nom du dispositif
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Microcontrôleur Salle Test"
                  className="w-full bg-transparent text-white placeholder-[#64748B] focus:outline-none"
                />
              </Carte>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">Seuils d&apos;alerte</h2>
            <div className="space-y-3">
              <Carte>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Température min (°C)</label>
                    <input type="number" value={temperatureMin} onChange={(e) => setTemperatureMin(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
                  </div>
                  <div>
                    <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Température max (°C)</label>
                    <input type="number" value={temperatureMax} onChange={(e) => setTemperatureMax(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
                  </div>
                </div>
              </Carte>
              <Carte>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Humidité min (%)</label>
                    <input type="number" value={humiditeMin} onChange={(e) => setHumiditeMin(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
                  </div>
                  <div>
                    <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Humidité max (%)</label>
                    <input type="number" value={humiditeMax} onChange={(e) => setHumiditeMax(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
                  </div>
                </div>
              </Carte>
              <Carte>
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Gaz max (%)</label>
                <input type="number" value={gazMax} onChange={(e) => setGazMax(e.target.value)} className="w-full bg-[#243447] text-white rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#FF9900]" />
              </Carte>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">Réception des alertes</h2>
            <div className="space-y-3">
              <Carte>
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full bg-transparent text-white placeholder-[#64748B] focus:outline-none"
                />
              </Carte>
            </div>
          </section>

          {erreur && (
            <p className="text-[#FF1744] text-sm text-center bg-[#FF1744]/10 py-2 rounded-lg">
              {erreur}
            </p>
          )}

          <div className="space-y-3 pt-2">
            <Bouton onClick={gererSoumission}>
              Enregistrer les modifications
            </Bouton>
            <button
              onClick={() => router.push("/")}
              className="w-full text-center text-[#94A3B8] text-sm font-medium py-2"
            >
              Annuler
            </button>
          </div>
        </>
      )}
    </>
  );
}

function ModifierDispositifForm() {
  const [monte, setMonte] = useState(false);
  const searchParams = useSearchParams();
  const devEui = searchParams.get("dev_eui") || "";

  useEffect(() => {
    setMonte(true);
  }, []);

  if (!monte) {
    return <p className="text-[#94A3B8] text-center">Chargement...</p>;
  }

  return <Formulaire devEui={devEui} />;
}

export default function ModifierDispositifPage() {
  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header titre="Modifier le dispositif" sousTitre="Modifier toutes les informations" />
      <main className="px-5 py-5 space-y-5">
        <Suspense fallback={<p className="text-[#94A3B8] text-center">Chargement...</p>}>
          <ModifierDispositifForm />
        </Suspense>
      </main>
    </div>
  );
}
