"use client";

import { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import Navigation from "@/components/ui/Navigation";
import Carte from "@/components/ui/Carte";
import Switch from "@/components/ui/Switch";
import IconeCapteur from "@/components/ui/IconeCapteur";
import { alertesRecentes as alertesMock } from "@/lib/mock-data";
import type { Alerte, ParametresNotification } from "@/types";
import { getParametresNotification,
  sauvegarderParametresNotification,
} from "@/lib/store";
import { validerEmail } from "@/lib/validators";
import {
  obtenirConfigAlertes,
  sauvegarderConfigAlertes,
} from "@/lib/api";

const CLE_ALERTES_LUES = "protecteur_alertes_lues";

function getAlertesLues(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CLE_ALERTES_LUES);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function sauvegarderAlertesLues(ids: string[]): void {
  localStorage.setItem(CLE_ALERTES_LUES, JSON.stringify(ids));
}

function IconeAlerte({ type }: { type: string }) {
  return <IconeCapteur type={type} />;
}

const niveauStyle = {
  info: "bg-[#00C853]/15 text-[#00C853]",
  warning: "bg-[#FF9900]/15 text-[#FF9900]",
  danger: "bg-[#FF1744]/15 text-[#FF1744]",
};

export default function NotificationsPage() {
  const [parametres, setParametres] = useState<ParametresNotification>(
    getParametresNotification()
  );
  const [email, setEmail] = useState("");
  const [alertesLues, setAlertesLues] = useState<string[]>(getAlertesLues);
  const [emailErreur, setEmailErreur] = useState("");

  useEffect(() => {
    sauvegarderParametresNotification(parametres);
  }, [parametres]);

  useEffect(() => {
    let annule = false;
    obtenirConfigAlertes().then((config) => {
      if (!annule && config?.email) setEmail(config.email);
    });
    return () => { annule = true; };
  }, []);

  const enregistrerEmail = () => {
    const valeur = email.trim();
    setEmailErreur("");
    if (!valeur) return;
    const err = validerEmail(valeur);
    if (err) { setEmailErreur(err); return; }
    sauvegarderConfigAlertes({ email: valeur });
  };

  const alertes: Alerte[] = alertesMock.map((a) => ({
    ...a,
    lue: alertesLues.includes(a.id),
  }));

  const marquerToutLu = () => {
    const tousIds = alertesMock.map((a) => a.id);
    setAlertesLues(tousIds);
    sauvegarderAlertesLues(tousIds);
  };

  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header titre="Notifications" sousTitre="Alertes et paramètres" />

      <main className="px-5 py-5 space-y-6">
        <section>
          <h2 className="text-white font-bold text-base mb-3">
            Email de réception
          </h2>
          <Carte>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailErreur("");
              }}
              onBlur={enregistrerEmail}
              placeholder="exemple@email.com"
              className="w-full bg-transparent text-white placeholder-[#64748B] focus:outline-none"
            />
            {emailErreur && (
              <p className="text-[#FF1744] text-xs mt-1">{emailErreur}</p>
            )}
            <p className="text-[#64748B] text-xs mt-2">
              Rapports détaillés et alertes envoyés par e-mail
            </p>
          </Carte>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">
            Paramètres push
          </h2>
          <Carte>
            <div className="divide-y divide-[#334155]">
              <Switch
                checked={parametres.activees}
                onChange={(v) =>
                  setParametres({ ...parametres, activees: v })
                }
                label="Notifications push"
                description="Recevoir des alertes sur votre téléphone"
              />
              <Switch
                checked={parametres.presences}
                onChange={(v) =>
                  setParametres({ ...parametres, presences: v })
                }
                label="Présence"
                description="Alerte mouvement non autorisé"
                disabled={!parametres.activees}
              />
              <Switch
                checked={parametres.temperatures}
                onChange={(v) =>
                  setParametres({ ...parametres, temperatures: v })
                }
                label="Température"
                description="Alerte seuil critique de température"
                disabled={!parametres.activees}
              />
              <Switch
                checked={parametres.gaz}
                onChange={(v) =>
                  setParametres({ ...parametres, gaz: v })
                }
                label="Gaz"
                description="Alerte concentration de gaz"
                disabled={!parametres.activees}
              />
              <Switch
                checked={parametres.humidites}
                onChange={(v) =>
                  setParametres({ ...parametres, humidites: v })
                }
                label="Humidité"
                description="Alerte taux d'humidité anormal"
                disabled={!parametres.activees}
              />
              <Switch
                checked={parametres.rapportsQuotidiens}
                onChange={(v) =>
                  setParametres({ ...parametres, rapportsQuotidiens: v })
                }
                label="Rapport quotidien"
                description="Résumé journalier de l'état du système"
                disabled={!parametres.activees}
              />
            </div>
          </Carte>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">
              Alertes récentes
            </h2>
            <button
              onClick={marquerToutLu}
              className="text-[#FF9900] text-xs font-medium"
            >
              Tout marquer lu
            </button>
          </div>

          <div className="space-y-2">
            {alertes.map((alerte) => (
              <Carte
                key={alerte.id}
                className={`${!alerte.lue ? "border-l-4 border-l-[#FF9900]" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${niveauStyle[alerte.niveau]}`}
                  >
                    <IconeAlerte type={alerte.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-tight">
                      {alerte.message}
                    </p>
                    <p className="text-[#64748B] text-xs mt-1">
                      {new Date(alerte.timestamp).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!alerte.lue && (
                    <div className="w-2 h-2 rounded-full bg-[#FF9900] shrink-0 mt-1.5" />
                  )}
                </div>
              </Carte>
            ))}
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
