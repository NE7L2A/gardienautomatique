"use client";

import { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import Navigation from "@/components/ui/Navigation";
import Carte from "@/components/ui/Carte";
import Switch from "@/components/ui/Switch";
import Bouton from "@/components/ui/Bouton";
import type { ParametresSMS } from "@/types";
import { getParametresSMS, sauvegarderParametresSMS } from "@/lib/store";
import { validerTelephone } from "@/lib/validators";

export default function SMSPage() {
  const [parametres, setParametres] = useState<ParametresSMS>(
    getParametresSMS()
  );
  const [messageTest, setMessageTest] = useState("");
  const [telErreur, setTelErreur] = useState("");

  useEffect(() => {
    sauvegarderParametresSMS(parametres);
  }, [parametres]);

  const envoyerTestSMS = () => {
    if (!parametres.numeroTelephone) {
      setMessageTest("Veuillez d'abord renseigner un numéro");
      setTimeout(() => setMessageTest(""), 3000);
      return;
    }
    const err = validerTelephone(parametres.numeroTelephone);
    if (err) {
      setMessageTest(err);
      setTimeout(() => setMessageTest(""), 3000);
      return;
    }
    setMessageTest(
      `SMS de test envoyé au ${parametres.numeroTelephone} (mock)`
    );
    setTimeout(() => setMessageTest(""), 3000);
  };

  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header titre="SMS" sousTitre="Notifications par SMS" />

      <main className="px-5 py-5 space-y-6">
        <Carte>
          <Switch
            checked={parametres.active}
            onChange={(v) => setParametres({ ...parametres, active: v })}
            label="Activer les SMS"
            description="Recevoir des alertes par message texte"
          />
        </Carte>

        <section>
          <h2 className="text-white font-bold text-base mb-3">
            Numéro de téléphone
          </h2>
          <Carte>
            <input
              type="tel"
              value={parametres.numeroTelephone}
              onChange={(e) => {
                setParametres({
                  ...parametres,
                  numeroTelephone: e.target.value,
                });
                setTelErreur("");
              }}
              onBlur={() => {
                if (parametres.numeroTelephone) {
                  const err = validerTelephone(parametres.numeroTelephone);
                  setTelErreur(err || "");
                }
              }}
              placeholder="+221 77 123 45 67"
              disabled={!parametres.active}
              className="w-full bg-transparent text-white placeholder-[#64748B] focus:outline-none disabled:opacity-40"
            />
            {telErreur && (
              <p className="text-[#FF1744] text-xs mt-1">{telErreur}</p>
            )}
          </Carte>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">
            Quand envoyer un SMS ?
          </h2>
          <Carte>
            <div className="divide-y divide-[#334155]">
              <Switch
                checked={parametres.alertesPresence}
                onChange={(v) =>
                  setParametres({ ...parametres, alertesPresence: v })
                }
                label="Présence"
                description="Mouvement non autorisé détecté"
                disabled={!parametres.active}
              />
              <Switch
                checked={parametres.toutesLesAlertes}
                onChange={(v) =>
                  setParametres({ ...parametres, toutesLesAlertes: v })
                }
                label="Toutes les alertes"
                description="Intrusion + Température + Flamme"
                disabled={!parametres.active}
              />
              <Switch
                checked={parametres.urgenceUniquement}
                onChange={(v) =>
                  setParametres({ ...parametres, urgenceUniquement: v })
                }
                label="Urgence uniquement"
                description="Uniquement les situations critiques"
                disabled={!parametres.active}
              />
            </div>
          </Carte>
        </section>

        <Bouton onClick={envoyerTestSMS} variante="secondaire">
          Envoyer un SMS de test
        </Bouton>

        {messageTest && (
          <p
            className={`text-sm text-center ${
              messageTest.includes("Veuillez")
                ? "text-[#FF1744]"
                : "text-[#00C853]"
            }`}
          >
            {messageTest}
          </p>
        )}

        <div className="bg-[#2979FF]/8 border border-[#2979FF]/15 rounded-xl p-3">
          <p className="text-[#2979FF] text-xs text-center leading-relaxed">
            Mode simulation — L&apos;envoi de SMS sera activé lorsque la passerelle
            Twilio sera connectée au backend.
          </p>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
