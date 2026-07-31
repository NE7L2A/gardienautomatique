import type { Capteur } from "@/types";
import Carte from "@/components/ui/Carte";
import { libelleTypeCapteur } from "@/lib/mock-data";

interface CarteCapteurProps {
  capteur: Capteur;
}

const icones = {
  temperature: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  humidite: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-5-5-11-5-11z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 13h4" />
    </svg>
  ),
  gaz: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h1m8-9v1m8 8h1M5.64 5.64l.7.7M18.36 5.64l-.7.7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8a5 5 0 00-5 5v1a5 5 0 0010 0v-1a5 5 0 00-5-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17h4" />
    </svg>
  ),
  presence: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  flamme: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
};

const couleursEtat = {
  normal: "border-l-[#00C853]",
  alerte: "border-l-[#FF9900]",
  danger: "border-l-[#FF1744]",
};

const bgIcone = {
  normal: "bg-[#00C853]/15 text-[#00C853]",
  alerte: "bg-[#FF9900]/15 text-[#FF9900]",
  danger: "bg-[#FF1744]/15 text-[#FF1744]",
};

const textEtat = {
  normal: "text-[#00C853]",
  alerte: "text-[#FF9900]",
  danger: "text-[#FF1744]",
};

const labelEtat = {
  normal: "Normal",
  alerte: "Attention",
  danger: "Danger",
};

export default function CarteCapteur({ capteur }: CarteCapteurProps) {
  return (
    <Carte className={`border-l-4 ${couleursEtat[capteur.etat]}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgIcone[capteur.etat]}`}>
          {icones[capteur.type]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-base">
            {capteur.nom}
          </p>
          <p className="text-[#94A3B8] text-xs">
            {libelleTypeCapteur[capteur.type]}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-right">
            <p className="text-white font-bold text-lg">
              {capteur.valeur}
              {capteur.unite && (
                <span className="text-sm font-normal ml-0.5 text-[#94A3B8]">{capteur.unite}</span>
              )}
            </p>
            <p className={`text-xs font-semibold ${textEtat[capteur.etat]}`}>
              {labelEtat[capteur.etat]}
            </p>
          </div>
        </div>
      </div>
    </Carte>
  );
}
