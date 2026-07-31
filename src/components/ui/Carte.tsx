"use client";

import { useTheme } from "@/lib/theme-context";

interface CarteProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Carte({
  children,
  className = "",
  onClick,
}: CarteProps) {
  const { t } = useTheme();

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 ${
        onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""
      } ${className}`}
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
      }}
    >
      {children}
    </div>
  );
}
