import type { EtatCapteur } from "@/types";

interface SemaphoreProps {
  etat: EtatCapteur;
  label?: string;
}

const configuration: Record<
  EtatCapteur,
  { couleur: string; lueur: string; texte: string; message: string; icone: React.ReactNode }
> = {
  normal: {
    couleur: "bg-[#00C853]",
    lueur: "rgba(0, 200, 83, 0.4)",
    texte: "text-[#00C853]",
    message: "Sécurisé",
    icone: (
      <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  alerte: {
    couleur: "bg-[#FF9900]",
    lueur: "rgba(255, 153, 0, 0.4)",
    texte: "text-[#FF9900]",
    message: "Vigilance",
    icone: (
      <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  },
  danger: {
    couleur: "bg-[#FF1744]",
    lueur: "rgba(255, 23, 68, 0.4)",
    texte: "text-[#FF1744]",
    message: "Alerte",
    icone: (
      <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 12" />
      </svg>
    ),
  },
};

export default function Semaphore({ etat, label }: SemaphoreProps) {
  const config = configuration[etat];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Cercle de lueur externe */}
        <div
          className="absolute -inset-3 rounded-full animate-pulse-respirant"
          style={{ "--pulse-color": config.lueur } as React.CSSProperties}
        />
        {/* Cercle principal */}
        <div
          className={`
            w-24 h-24 rounded-full ${config.couleur}
            flex items-center justify-center
            shadow-[0_0_30px_${config.lueur}]
          `}
          style={{ boxShadow: `0 0 30px ${config.lueur}` }}
        >
          {config.icone}
        </div>
      </div>

      <span className={`text-sm font-bold tracking-wide ${config.texte}`}>
        {label || config.message}
      </span>
    </div>
  );
}
