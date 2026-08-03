"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/Header";
import Navigation from "@/components/ui/Navigation";
import Carte from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import { validerEmail, validerTelephone } from "@/lib/validators";
import { obtenirConfigAlertes, sauvegarderConfigAlertes } from "@/lib/api";
import type { ThemeNom } from "@/types";

const THEMES: { valeur: ThemeNom; label: string; description: string; icone: string }[] = [
  { valeur: "dark", label: "Sombre", description: "Navy profond — thème par défaut", icone: "🌙" },
  { valeur: "light", label: "Clair", description: "Net et lumineux", icone: "☀️" },
  { valeur: "nord", label: "Nord", description: "Aurora polaire — tons froids", icone: "❄️" },
];

function lireProfil() {
  if (typeof window === "undefined")
    return { email: "", telephone: "", nomDomicile: "", adresse: "", theme: "dark" as ThemeNom };
  try {
    const str = localStorage.getItem("protecteur_utilisateur");
    if (str) {
      const u = JSON.parse(str);
      return {
        email: u.email || "",
        telephone: u.telephone || "",
        nomDomicile: u.nomDomicile || "",
        adresse: u.adresse || "",
        theme: (u.theme || "dark") as ThemeNom,
      };
    }
  } catch {}
  return { email: "", telephone: "", nomDomicile: "", adresse: "", theme: "dark" as ThemeNom };
}

export default function ParametresPage() {
  const router = useRouter();
  const profilInit = useState(lireProfil)[0];

  const [email, setEmail] = useState(profilInit.email);
  const [telephone, setTelephone] = useState(profilInit.telephone);
  const [nomDomicile, setNomDomicile] = useState(profilInit.nomDomicile);
  const [adresse, setAdresse] = useState(profilInit.adresse);
  const [theme, setTheme] = useState<ThemeNom>(profilInit.theme);
  const [message, setMessage] = useState("");
  const [emailErreur, setEmailErreur] = useState("");
  const [telErreur, setTelErreur] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    let annule = false;
    obtenirConfigAlertes().then((config) => {
      if (annule) return;
      if (config?.email) setEmail(config.email);
      if (config?.sms) setTelephone(config.sms);
    });
    return () => { annule = true; };
  }, []);

  const sauvegarder = () => {
    setEmailErreur("");
    setTelErreur("");

    if (email) {
      const errEmail = validerEmail(email);
      if (errEmail) {
        setEmailErreur(errEmail);
        return;
      }
    }
    if (telephone) {
      const errTel = validerTelephone(telephone);
      if (errTel) {
        setTelErreur(errTel);
        return;
      }
    }
    const utilisateurStr = localStorage.getItem("protecteur_utilisateur");
    let utilisateur = utilisateurStr ? JSON.parse(utilisateurStr) : {};
    utilisateur = {
      ...utilisateur,
      email,
      telephone,
      nomDomicile,
      adresse,
      theme,
    };
    localStorage.setItem("protecteur_utilisateur", JSON.stringify(utilisateur));
    localStorage.setItem("protecteur_theme", JSON.stringify(theme));
    sauvegarderConfigAlertes({ email, sms: telephone });
    setMessage("Profil sauvegardé");
    setTimeout(() => setMessage(""), 2500);
  };

  const deconnecter = () => {
    router.replace("/");
  };

  const reinitialiser = () => {
    localStorage.clear();
    router.replace("/splash");
  };

  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header titre="Profil" sousTitre="Paramètres de l'application" />

      <main className="px-5 py-5 space-y-6">
        {/* Photo + nom */}
        <section>
          <Carte>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#FF9900]/10 flex items-center justify-center ring-1 ring-[#FF9900]/20">
                <Image
                  src="/logo.png"
                  alt="Avatar"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <label className="text-[#94A3B8] text-xs font-medium mb-0.5 block">
                  Nom du domicile
                </label>
                <input
                  type="text"
                  value={nomDomicile}
                  onChange={(e) => setNomDomicile(e.target.value)}
                  placeholder="Mon domicile"
                  className="w-full bg-transparent text-white font-semibold text-sm placeholder-[#64748B] focus:outline-none"
                />
              </div>
            </div>
          </Carte>
        </section>

        {/* Email */}
        <section>
          <h2 className="text-white font-bold text-base mb-3">
            Notifications
          </h2>
          <Carte>
            <div className="space-y-4">
              <div>
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                  Email de réception
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailErreur("");
                  }}
                  placeholder="exemple@email.com"
                  className="w-full bg-transparent text-white text-sm placeholder-[#64748B] focus:outline-none"
                />
                {emailErreur && (
                  <p className="text-[#FF1744] text-xs mt-1">{emailErreur}</p>
                )}
              </div>
              <div className="border-t border-[#334155] pt-4">
                <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
                  Numéro de téléphone (SMS)
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => {
                    setTelephone(e.target.value);
                    setTelErreur("");
                  }}
                  placeholder="+221 77 123 45 67"
                  className="w-full bg-transparent text-white text-sm placeholder-[#64748B] focus:outline-none"
                />
                {telErreur && (
                  <p className="text-[#FF1744] text-xs mt-1">{telErreur}</p>
                )}
              </div>
            </div>
          </Carte>
        </section>

        {/* Adresse */}
        <section>
          <h2 className="text-white font-bold text-base mb-3">Adresse</h2>
          <Carte>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Adresse du domicile"
              className="w-full bg-transparent text-white text-sm placeholder-[#64748B] focus:outline-none"
            />
          </Carte>
        </section>

        {/* Theme */}
        <section>
          <h2 className="text-white font-bold text-base mb-3">Thème</h2>
          <div className="space-y-2">
            {THEMES.map((t) => (
              <Carte
                key={t.valeur}
                onClick={() => setTheme(t.valeur)}
                className={`cursor-pointer transition-all ${
                  theme === t.valeur
                    ? "border-[#FF9900] bg-[#FF9900]/5"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.icone}</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{t.label}</p>
                    <p className="text-[#94A3B8] text-xs">{t.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      theme === t.valeur
                        ? "border-[#FF9900]"
                        : "border-[#334155]"
                    }`}
                  >
                    {theme === t.valeur && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
                    )}
                  </div>
                </div>
              </Carte>
            ))}
          </div>
        </section>

        {/* Système + version */}
        <section>
          <Carte>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Système</span>
                <span className="text-[#94A3B8]">LoRaWAN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Version</span>
                <span className="text-[#94A3B8]">1.0.0</span>
              </div>
            </div>
          </Carte>
        </section>

        {/* Message */}
        {message && (
          <p className="text-[#00C853] text-sm text-center bg-[#00C853]/10 py-2 rounded-lg">
            {message}
          </p>
        )}

        {/* Sauvegarder */}
        <div className="space-y-3">
          <Bouton onClick={sauvegarder}>
            Sauvegarder le profil
          </Bouton>
          <Bouton onClick={deconnecter} variante="secondaire">
            Se déconnecter
          </Bouton>
          <Bouton onClick={reinitialiser} variante="danger">
            Réinitialiser l&apos;application
          </Bouton>
        </div>

        {/* À propos */}
        <section>
          <h2 className="text-white font-bold text-base mb-3">
            À propos
          </h2>
          <Carte>
            <div className="space-y-3 text-sm text-[#94A3B8] leading-relaxed">
              <p>
                <strong className="text-white">EYESHOME</strong> est un
                système de sécurité domestique intelligent basé sur la
                technologie LoRaWAN.
              </p>
              <p>
                Les capteurs (température, humidité, gaz, présence) communiquent via
                 radio LoRa vers une gateway ESP32, qui transmet les données au
                 serveur de traitement.
              </p>
              <div className="pt-2 border-t border-[#334155]">
                <p className="text-[#64748B] text-xs text-center">
                  EYESHOME v1.0.0 — Sécurité domestique LoRaWAN
                </p>
              </div>
            </div>
          </Carte>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
