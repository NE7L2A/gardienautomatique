import type { Capteur } from "@/types";
import Carte from "@/components/ui/Carte";
import IconeCapteur from "@/components/ui/IconeCapteur";
import { libelleTypeCapteur } from "@/lib/mock-data";

interface CarteCapteurProps {
  capteur: Capteur;
}

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
          <IconeCapteur type={capteur.type} className="w-7 h-7" />
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
