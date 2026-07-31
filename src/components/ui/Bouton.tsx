"use client";

import { useTheme } from "@/lib/theme-context";

interface BoutonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variante?: "primaire" | "secondaire" | "danger";
  plein?: boolean;
  desactive?: boolean;
  className?: string;
}

export default function Bouton({
  children,
  onClick,
  variante = "primaire",
  plein = true,
  desactive = false,
  className = "",
}: BoutonProps) {
  const { t } = useTheme();

  const stylesVariante = {
    primaire: {
      background: t.primary,
      color: t.primaryText,
      border: "none",
      boxShadow: `0 2px 12px ${t.primary}4D`,
    },
    secondaire: {
      background: "transparent",
      color: t.primary,
      border: `2px solid ${t.primary}66`,
    },
    danger: {
      background: t.danger,
      color: "#FFFFFF",
      border: "none",
      boxShadow: `0 2px 12px ${t.danger}4D`,
    },
  };

  const base =
    "rounded-xl font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";
  const taille = plein ? "w-full py-4 px-6" : "py-3 px-6";

  return (
    <button
      onClick={onClick}
      disabled={desactive}
      className={`${base} ${taille} ${className}`}
      style={stylesVariante[variante]}
    >
      {children}
    </button>
  );
}
