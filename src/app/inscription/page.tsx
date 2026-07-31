"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Bouton from "@/components/ui/Bouton";
import { validerEmail } from "@/lib/validators";

export default function InscriptionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");

  const gererSoumission = () => {
    setErreur("");

    if (!email || !motDePasse) {
      setErreur("Veuillez remplir tous les champs");
      return;
    }
    const erreurEmail = validerEmail(email);
    if (erreurEmail) {
      setErreur(erreurEmail);
      return;
    }
    if (motDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur("Les mots de passe ne correspondent pas");
      return;
    }

    localStorage.setItem(
      "protecteur_utilisateur",
      JSON.stringify({
        id: "user-001",
        email: email,
        nomDomicile: "",
        adresse: "",
      })
    );

    const etat = {
      premierLancement: false,
      inscriptionComplete: true,
      setupComplete: false,
      utilisateurConnecte: true,
    };
    localStorage.setItem("protecteur_etat_app", JSON.stringify(etat));

    router.push("/setup");
  };

  return (
    <div className="min-h-screen bg-[#1A2332] flex flex-col items-center px-6 py-12 relative">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #FF9900 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative flex items-center gap-2 mb-8 self-start">
        <div className="w-8 h-8 rounded-lg bg-[#243447] flex items-center justify-center overflow-hidden ring-1 ring-[#FF9900]/20">
          <Image src="/logo.png" alt="EYESHOME" width={28} height={28} className="object-cover w-full h-full" />
        </div>
        <span className="text-white font-bold text-sm tracking-wider">EYESHOME</span>
      </div>

      <div className="relative w-20 h-20 rounded-full bg-[#243447] flex items-center justify-center ring-1 ring-[#FF9900]/20 mb-6">
        <Image
          src="/logo.png"
          alt="EYESHOME"
          width={56}
          height={56}
          className="object-contain"
        />
      </div>

      <h1 className="relative text-white text-2xl font-bold mb-1">
        Créer votre compte
      </h1>
      <p className="relative text-[#94A3B8] text-sm mb-8">
        Configurez votre système de sécurité
      </p>

      <div className="relative w-full max-w-sm space-y-4">
        <div>
          <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
            Adresse email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="w-full bg-[#243447] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/30 transition-colors"
          />
        </div>

        <div>
          <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
            Mot de passe
          </label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="Minimum 6 caractères"
            className="w-full bg-[#243447] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/30 transition-colors"
          />
        </div>

        <div>
          <label className="text-[#94A3B8] text-xs font-medium mb-1 block">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Retapez le mot de passe"
            className="w-full bg-[#243447] border border-[#334155] rounded-xl px-4 py-3.5 text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/30 transition-colors"
          />
        </div>

        {erreur && (
          <p className="text-[#FF1744] text-sm text-center bg-[#FF1744]/10 py-2 rounded-lg">
            {erreur}
          </p>
        )}

        <div className="pt-2">
          <Bouton onClick={gererSoumission}>S&apos;inscrire</Bouton>
        </div>

        <p className="text-center text-[#64748B] text-sm pt-2">
          Déjà un compte ?{" "}
          <button
            onClick={() => router.push("/connexion")}
            className="text-[#FF9900] font-semibold"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
