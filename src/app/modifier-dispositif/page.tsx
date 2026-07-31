"use client";

import { useState, Suspense, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/ui/Header";
import Bouton from "@/components/ui/Bouton";
import Carte from "@/components/ui/Carte";
import { validerEmail, validerTelephone } from "@/lib/validators";
import { getDispositifParId, getDeviceIdBd } from "@/lib/dispositifs";
import {
  getDispositifInfos,
  sauvegarderDispositifInfos,
  getSeuilsCapteur,
  sauvegarderSeuilsCapteur,
  getContactNotification,
  sauvegarderContactNotification,
} from "@/lib/store";

function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface DonneesModification {
  existe: boolean;
  idBD: string;
  nom: string;
  temperatureMin: string;
  temperatureMax: string;
  humiditeMin: string;
  humiditeMax: string;
  gazMax: string;
  presenceActive: boolean;
  email: string;
  sms: string;
}

const donneesVides: DonneesModification = {
  existe: false,
  idBD: "",
  nom: "",
  temperatureMin: "18",
  temperatureMax: "28",
  humiditeMin: "20",
  humiditeMax: "80",
  gazMax: "60",
  presenceActive: true,
  email: "",
  sms: "",
};

function chargerDonnees(baseId: string): DonneesModification {
  const dispositif = getDispositifParId(baseId);
  if (!dispositif) return donneesVides;

  const infos = getDispositifInfos(baseId);
  const seuils = getSeuilsCapteur(baseId);
  const contact = getContactNotification();

  return {
    existe: true,
    idBD: infos?.idBD ?? getDeviceIdBd(baseId) ?? "",
    nom: infos?.nom || dispositif.nom,
    temperatureMin:
      seuils?.temperatureMin !== undefined ? String(seuils.temperatureMin) : "18",
    temperatureMax:
      seuils?.temperatureMax !== undefined ? String(seuils.temperatureMax) : "28",
    humiditeMin:
      seuils?.humiditeMin !== undefined ? String(seuils.humiditeMin) : "20",
    humiditeMax:
      seuils?.humiditeMax !== undefined ? String(seuils.humiditeMax) : "80",
    gazMax: seuils?.gazMax !== undefined ? String(seuils.gazMax) : "60",
    presenceActive: seuils?.presenceActive ?? true,
    email: contact.email,
    sms: contact.telephone,
  };
}

function Formulaire({ baseId }: { baseId: string }) {
  const router = useRouter();

  const [donnees] = useState(() => chargerDonnees(baseId));
  const [idBD, setIdBD] = useState(donnees.idBD);
  const [nom, setNom] = useState(donnees.nom);
  const [temperatureMin, setTemperatureMin] = useState(donnees.temperatureMin);
  const [temperatureMax, setTemperatureMax] = useState(donnees.temperatureMax);
  const [humiditeMin, setHumiditeMin] = useState(donnees.humiditeMin);
  const [humiditeMax, setHumiditeMax] = useState(donnees.humiditeMax);
  const [gazMax, setGazMax] = useState(donnees.gazMax);
  const [presenceActive, setPresenceActive] = useState(donnees.presenceActive);
  const [email, setEmail] = useState(donnees.email);
  const [sms, setSms] = useState(donnees.sms);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  if (!donnees.existe) {
    return (
      <div className="text-center space-y-4">
        <p className="text-[#94A3B8] text-center">Dispositif introuvable</p>
        <button
          onClick={() => router.push("/")}
          className="text-[#FF9900] text-sm font-medium"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  const gererSoumission = () => {
    setErreur("");

    if (!idBD.trim()) {
      setErreur("L'ID du dispositif (BD) est requis");
      return;
    }
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
    if (sms) {
      const errTel = validerTelephone(sms);
      if (errTel) {
        setErreur(errTel);
        return;
      }
    }

    const seuilsExistants = getSeuilsCapteur(baseId);

    sauvegarderDispositifInfos(baseId, {
      idBD: idBD.trim(),
      nom: nom.trim(),
    });
    sauvegarderSeuilsCapteur({
      capteurId: baseId,
      temperatureMin: parseFloat(temperatureMin) || undefined,
      temperatureMax: parseFloat(temperatureMax) || undefined,
      humiditeMin: parseFloat(humiditeMin) || undefined,
      humiditeMax: parseFloat(humiditeMax) || undefined,
      gazMax: parseFloat(gazMax) || undefined,
      presenceActive,
      flammeActive: seuilsExistants?.flammeActive ?? true,
    });
    sauvegarderContactNotification({
      telephone: sms,
      email,
    });

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
                  ID dans la base de données
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
              <Carte>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={presenceActive} onChange={(e) => setPresenceActive(e.target.checked)} className="w-4 h-4 accent-[#FF9900]" />
                  <span className="text-white text-sm">Détection de présence active</span>
                </label>
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
              <Carte>
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                  Numéro SMS
                </label>
                <input
                  type="tel"
                  value={sms}
                  onChange={(e) => setSms(e.target.value)}
                  placeholder="+221 77 123 45 67"
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
  const monté = useMounted();
  const searchParams = useSearchParams();
  const baseId = searchParams.get("id") || "";

  if (!monté) {
    return <p className="text-[#94A3B8] text-center">Chargement...</p>;
  }

  return <Formulaire baseId={baseId} />;
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
