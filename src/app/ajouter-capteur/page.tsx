"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Bouton from "@/components/ui/Bouton";
import Carte from "@/components/ui/Carte";
import { creerDispositif, sauvegarderConfigAlertes } from "@/lib/api";
import { validerEmail } from "@/lib/validators";

export default function AjouterCapteurPage() {
  const router = useRouter();

  const [idBD, setIdBD] = useState("");
  const [nom, setNom] = useState("");
  const [temperatureMin, setTemperatureMin] = useState("18");
  const [temperatureMax, setTemperatureMax] = useState("28");
  const [humiditeMin, setHumiditeMin] = useState("20");
  const [humiditeMax, setHumiditeMax] = useState("80");
  const [gazMax, setGazMax] = useState("60");
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  const gererSoumission = async () => {
    setErreur("");

    if (
      !idBD.trim() ||
      !nom.trim() ||
      !temperatureMin.trim() ||
      !temperatureMax.trim() ||
      !humiditeMin.trim() ||
      !humiditeMax.trim() ||
      !gazMax.trim() ||
      !email.trim()
    ) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }
    const errEmail = validerEmail(email);
    if (errEmail) { setErreur(errEmail); return; }

    const dispositif = await creerDispositif(idBD.trim(), nom.trim());
    if (!dispositif) {
      setErreur("Impossible de créer le dispositif. Vérifiez la connexion au serveur.");
      return;
    }

    const config = await sauvegarderConfigAlertes({
      email,
      temp_min: parseFloat(temperatureMin),
      temp_max: parseFloat(temperatureMax),
      hum_min: parseFloat(humiditeMin),
      hum_max: parseFloat(humiditeMax),
      gaz_max: parseFloat(gazMax),
    });
    if (!config) {
      setErreur("Impossible d'enregistrer la configuration des alertes. Vérifiez la connexion au serveur.");
      return;
    }

    setSucces(true);
    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header titre="Configurer un dispositif" sousTitre="Ajouter votre microcontrôleur" />

      <main className="px-5 py-5 space-y-5">
        {succes ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fondu">
            <div className="w-20 h-20 rounded-full bg-[#00C853]/15 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-bold text-lg">Dispositif ajouté</p>
            <p className="text-[#94A3B8] text-sm mt-1">Redirection vers le tableau de bord...</p>
          </div>
        ) : (
          <>
            {/* Dev EUI */}
            <section>
              <h2 className="text-white font-bold text-base mb-3">Identité du dispositif</h2>
              <div className="space-y-3">
                <Carte>
                  <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                    Dev EUI
                  </label>
                  <input
                    type="text"
                    value={idBD}
                    onChange={(e) => setIdBD(e.target.value)}
                    placeholder="Ex: ESP32_001"
                    className="w-full bg-transparent text-white placeholder-[#64748B] focus:outline-none"
                  />
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

            {/* Seuils d'alerte */}
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

            {/* Notifications */}
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
                Ajouter le dispositif
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
      </main>
    </div>
  );
}
