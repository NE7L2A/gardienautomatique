"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/ui/Header";
import Bouton from "@/components/ui/Bouton";
import Carte from "@/components/ui/Carte";
import { getCapteursAjoutes, sauvegarderCapteursAjoutes } from "@/lib/store";
import type { Capteur } from "@/types";

function ModifierForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";

  const capteurInitial =
    getCapteursAjoutes().find((c) => c.id === id) ?? null;

  const [capteur] = useState<Capteur | null>(capteurInitial);
  const [nom, setNom] = useState(capteurInitial?.nom ?? "");
  const [salle, setSalle] = useState(capteurInitial?.salle ?? "Salle Test");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  const gererSoumission = () => {
    setErreur("");
    if (!nom.trim()) { setErreur("Donnez un nom au capteur"); return; }
    const capteurs = getCapteursAjoutes();
    const index = capteurs.findIndex((c) => c.id === id);
    if (index === -1) { setErreur("Capteur introuvable"); return; }
    capteurs[index] = {
      ...capteurs[index],
      nom: nom.trim(),
      salle,
    };
    sauvegarderCapteursAjoutes(capteurs);
    setSucces(true);
    setTimeout(() => router.push("/"), 1500);
  };

  if (!capteur) {
    return (
      <div className="text-center space-y-4">
        <p className="text-[#94A3B8] text-center">Capteur introuvable</p>
        <button onClick={() => router.push("/")} className="text-[#FF9900] text-sm font-medium">Retour à l&apos;accueil</button>
      </div>
    );
  }

  return (
    <>
      {succes ? (
        <div className="flex flex-col items-center justify-center py-16 animate-fondu">
          <div className="w-20 h-20 rounded-full bg-[#00C853]/15 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white font-bold text-lg">Capteur modifié</p>
          <p className="text-[#94A3B8] text-sm mt-1">Redirection...</p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-white font-bold text-base mb-3">Identité</h2>
            <Carte>
              <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Nom</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Capteur salon..." className="w-full bg-transparent text-white placeholder-[#64748B] focus:outline-none" />
            </Carte>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-3">Emplacement</h2>
            <Carte>
              <label className="text-[#94A3B8] text-xs font-medium mb-1 block">Salle</label>
              <input type="text" value={salle} onChange={(e) => setSalle(e.target.value)} placeholder="Nom de la salle..." className="w-full bg-transparent text-white placeholder-[#64748B] focus:outline-none" />
            </Carte>
          </section>
          {erreur && <p className="text-[#FF1744] text-sm text-center bg-[#FF1744]/10 py-2 rounded-lg">{erreur}</p>}
          <div className="space-y-3 pt-2">
            <Bouton onClick={gererSoumission}>Enregistrer</Bouton>
            <button onClick={() => router.push("/")} className="w-full text-center text-[#94A3B8] text-sm font-medium py-2">Annuler</button>
          </div>
        </>
      )}
    </>
  );
}

export default function ModifierCapteurPage() {
  return (
    <div className="min-h-screen bg-[#1A2332] pb-24">
      <Header titre="Modifier" sousTitre="Modifier un capteur" />
      <main className="px-5 py-5 space-y-5">
        <Suspense fallback={<p className="text-[#94A3B8] text-center">Chargement...</p>}>
          <ModifierForm />
        </Suspense>
      </main>
    </div>
  );
}
