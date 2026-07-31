"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Bouton from "@/components/ui/Bouton";
import Switch from "@/components/ui/Switch";

const TOTAL_ETAPES = 3;

export default function SetupPage() {
  const router = useRouter();
  const [etape, setEtape] = useState(1);

  const [nomDomicile, setNomDomicile] = useState("Mon domicile");
  const [adresse, setAdresse] = useState("");
  const [numeroTelephone, setNumeroTelephone] = useState("");
  const [notificationsActivees, setNotificationsActivees] = useState(true);

  const etapeSuivante = () => {
    if (etape < TOTAL_ETAPES) {
      setEtape(etape + 1);
    } else {
      finaliserSetup();
    }
  };

  const etapePrecedente = () => {
    if (etape > 1) {
      setEtape(etape - 1);
    }
  };

  const finaliserSetup = () => {
    const utilisateurStr = localStorage.getItem("protecteur_utilisateur");
    const utilisateur = utilisateurStr ? JSON.parse(utilisateurStr) : {};
    utilisateur.nomDomicile = nomDomicile;
    utilisateur.adresse = adresse;
    localStorage.setItem("protecteur_utilisateur", JSON.stringify(utilisateur));

    localStorage.setItem(
      "protecteur_sms",
      JSON.stringify({
        active: numeroTelephone.length > 0,
        numeroTelephone: numeroTelephone,
        alertesPresence: true,
        toutesLesAlertes: false,
        urgenceUniquement: true,
      })
    );

    localStorage.setItem(
      "protecteur_notifications",
      JSON.stringify({
        activees: notificationsActivees,
        presences: true,
        temperatures: true,
        flammes: true,
        batteries: false,
        rapportsQuotidiens: false,
        email: "",
      })
    );

    const etatStr = localStorage.getItem("protecteur_etat_app");
    const etat = etatStr ? JSON.parse(etatStr) : {};
    etat.setupComplete = true;
    localStorage.setItem("protecteur_etat_app", JSON.stringify(etat));

    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#1A2332] flex flex-col relative">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #FF9900 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#64748B] text-xs font-medium">
            Étape {etape} sur {TOTAL_ETAPES}
          </span>
          <span className="text-[#FF9900] text-xs font-semibold">
            {Math.round((etape / TOTAL_ETAPES) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-[#334155] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF9900] rounded-full transition-all duration-300"
            style={{ width: `${(etape / TOTAL_ETAPES) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-16 h-16 rounded-full bg-[#243447] flex items-center justify-center ring-1 ring-[#FF9900]/20 mb-6">
          <Image
            src="/logo.png"
            alt="EYESHOME"
            width={44}
            height={44}
            className="object-contain"
          />
        </div>

        {etape === 1 && (
          <div className="w-full max-w-sm animate-fondu">
            <h2 className="text-white text-xl font-bold mb-1 text-center">
              Votre domicile
            </h2>
            <p className="text-[#94A3B8] text-sm mb-8 text-center">
              Donnez un nom à votre lieu de sécurité
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                  Nom du domicile
                </label>
                <input
                  type="text"
                  value={nomDomicile}
                  onChange={(e) => setNomDomicile(e.target.value)}
                  placeholder="Ex: Chez moi, Villa Famadou..."
                  className="w-full bg-[#243447] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/30 transition-colors"
                />
              </div>

              <div>
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                  Adresse (optionnel)
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Quartier, ville..."
                  className="w-full bg-[#243447] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/30 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {etape === 2 && (
          <div className="w-full max-w-sm animate-fondu">
            <h2 className="text-white text-xl font-bold mb-1 text-center">
              Notifications SMS
            </h2>
            <p className="text-[#94A3B8] text-sm mb-8 text-center">
              Recevez des alertes par SMS en cas d&apos;urgence
            </p>

            <div>
              <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={numeroTelephone}
                onChange={(e) => setNumeroTelephone(e.target.value)}
                placeholder="+221 77 123 45 67"
                className="w-full bg-[#243447] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/30 transition-colors"
              />
            </div>

            <p className="text-[#64748B] text-xs mt-3 text-center">
              Vous pouvez ignorer cette étape et la configurer plus tard
            </p>
          </div>
        )}

        {etape === 3 && (
          <div className="w-full max-w-sm animate-fondu">
            <h2 className="text-white text-xl font-bold mb-1 text-center">
              Notifications push
            </h2>
            <p className="text-[#94A3B8] text-sm mb-8 text-center">
              Soyez averti instantanément sur votre téléphone
            </p>

            <div className="bg-[#243447] rounded-2xl border border-[#334155] p-4">
              <Switch
                checked={notificationsActivees}
                onChange={setNotificationsActivees}
                label="Activer les notifications push"
                description="Recevoir des alertes directement sur votre téléphone"
              />
            </div>

            <p className="text-[#64748B] text-xs mt-3 text-center">
              Vous pouvez modifier ce réglage à tout moment
            </p>
          </div>
        )}
      </div>

      <div className="relative px-6 pb-8 space-y-3">
        <Bouton onClick={etapeSuivante}>
          {etape === TOTAL_ETAPES ? "Terminer" : "Continuer"}
        </Bouton>

        {etape > 1 && (
          <button
            onClick={etapePrecedente}
            className="w-full text-center text-[#FF9900] text-sm font-medium py-2"
          >
            Retour
          </button>
        )}

        {etape < TOTAL_ETAPES && (
          <button
            onClick={etapeSuivante}
            className="w-full text-center text-[#64748B] text-xs py-1"
          >
            Passer cette étape
          </button>
        )}
      </div>
    </div>
  );
}
