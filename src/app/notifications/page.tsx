"use client";

import { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import Navigation from "@/components/ui/Navigation";
import Carte from "@/components/ui/Carte";
import Switch from "@/components/ui/Switch";
import Bouton from "@/components/ui/Bouton";
import { alertesRecentes as alertesMock } from "@/lib/mock-data";
import type { Alerte, ParametresNotification } from "@/types";
import { getParametresNotification,
  sauvegarderParametresNotification,
} from "@/lib/store";
import { validerEmail } from "@/lib/validators";
import { envoyerRapportQuotidien, mettreAJourConfigAlerte } from "@/lib/api";

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
  if (type === "presence")
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  if (type === "flamme")
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    );
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
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
  const [alertesLues, setAlertesLues] = useState<string[]>(getAlertesLues);
  const [emailErreur, setEmailErreur] = useState("");
  const [rapportEnCours, setRapportEnCours] = useState(false);
  const [messageRapport, setMessageRapport] = useState("");
  const [typeRapport, setTypeRapport] = useState<"ok" | "err">("ok");

  useEffect(() => {
    sauvegarderParametresNotification(parametres);
  }, [parametres]);

  const alertes: Alerte[] = alertesMock.map((a) => ({
    ...a,
    lue: alertesLues.includes(a.id),
  }));

  const envoyerRapport = async () => {
    setMessageRapport("");
    if (!parametres.email) {
      setTypeRapport("err");
      setMessageRapport("Renseignez d'abord un email de réception.");
      return;
    }
    const err = validerEmail(parametres.email);
    if (err) {
      setTypeRapport("err");
      setMessageRapport(err);
      return;
    }
    setRapportEnCours(true);
    const reponse = await envoyerRapportQuotidien(parametres.email);
    setRapportEnCours(false);

    if (!reponse) {
      setTypeRapport("err");
      setMessageRapport("Serveur de données injoignable — envoi impossible.");
      return;
    }
    if (reponse.resultat?.statut === "envoye") {
      setTypeRapport("ok");
      setMessageRapport(
        `Rapport envoyé à ${reponse.resultat.destinataire} (moyennes du jour).`
      );
    } else if (reponse.resultat?.statut === "non_configuré") {
      setTypeRapport("err");
      setMessageRapport("Envoi email non configuré côté serveur (SMTP manquant).");
    } else {
      setTypeRapport("err");
      setMessageRapport(reponse.erreur || "Échec de l'envoi du rapport.");
    }
  };

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
              value={parametres.email}
              onChange={(e) => {
                setParametres({ ...parametres, email: e.target.value });
                setEmailErreur("");
              }}
              onBlur={() => {
                if (parametres.email) {
                  const err = validerEmail(parametres.email);
                  setEmailErreur(err || "");
                  if (!err) {
                    void mettreAJourConfigAlerte({ email: parametres.email.trim() });
                  }
                }
              }}
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
            Alertes automatiques
          </h2>
          <Carte>
            <div className="divide-y divide-[#334155]">
              <Switch
                checked={parametres.activees}
                onChange={(v) =>
                  setParametres({ ...parametres, activees: v })
                }
                label="Notifications automatiques"
                description="Alerte dans l'app + envoi par email/SMS selon vos choix"
              />
              <Switch
                checked={parametres.presences}
                onChange={(v) =>
                  setParametres({ ...parametres, presences: v })
                }
                label="Présence"
                description="Mouvement non autorisé → alerte in-app + email/SMS"
                disabled={!parametres.activees}
              />
              <Switch
                checked={parametres.temperatures}
                onChange={(v) =>
                  setParametres({ ...parametres, temperatures: v })
                }
                label="Température"
                description="Seuil critique dépassé → alerte in-app + email/SMS"
                disabled={!parametres.activees}
              />
              <Switch
                checked={parametres.gaz}
                onChange={(v) =>
                  setParametres({ ...parametres, gaz: v })
                }
                label="Gaz"
                description="Concentration de gaz dangereuse → alerte in-app + email/SMS"
                disabled={!parametres.activees}
              />
              <Switch
                checked={parametres.humidites}
                onChange={(v) =>
                  setParametres({ ...parametres, humidites: v })
                }
                label="Humidité"
                description="Taux d'humidité anormal → alerte in-app + email/SMS"
                disabled={!parametres.activees}
              />
              <Switch
                checked={parametres.rapportsQuotidiens}
                onChange={(v) =>
                  setParametres({ ...parametres, rapportsQuotidiens: v })
                }
                label="Rapport quotidien"
                description="Moyennes journalières de chaque capteur par e-mail"
                disabled={!parametres.activees}
              />
            </div>
          </Carte>
        </section>

        <Bouton
          onClick={envoyerRapport}
          variante="secondaire"
          desactive={rapportEnCours}
        >
          {rapportEnCours
            ? "Envoi du rapport en cours..."
            : "Envoyer le rapport quotidien maintenant"}
        </Bouton>
        {messageRapport && (
          <p
            className={`text-sm text-center ${
              typeRapport === "err" ? "text-[#FF1744]" : "text-[#00C853]"
            }`}
          >
            {messageRapport}
          </p>
        )}

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
