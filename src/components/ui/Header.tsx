"use client";

import Image from "next/image";
import { useTheme } from "@/lib/theme-context";

interface HeaderProps {
  titre?: string;
  sousTitre?: string;
}

export default function Header({
  titre = "EYESHOME",
  sousTitre = "Sécurité domestique",
}: HeaderProps) {
  const { t, theme, toggle } = useTheme();

  return (
    <header
      className="relative flex items-center justify-between px-5 py-4 overflow-hidden"
      style={{ background: t.navBg }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${t.primary} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: t.bgDeep }}
        >
          <Image
            src="/logo.png"
            alt="EYESHOME"
            width={44}
            height={44}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <h1
            className="font-bold text-lg leading-tight tracking-tight"
            style={{ color: t.text }}
          >
            {titre}
          </h1>
          <p className="text-xs" style={{ color: t.textMuted }}>
            {sousTitre}
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: `${t.bgDeep}CC`, border: `1px solid ${t.borderSubtle}` }}
          aria-label="Changer de thème"
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="4" stroke={t.primary} strokeWidth="1.5" fill="none" />
              <path d="M11 2v3M11 17v3M2 11h3M17 11h3M4.22 4.22l2.12 2.12M15.66 15.66l2.12 2.12M4.22 17.78l2.12-2.12M15.66 6.34l2.12-2.12" stroke={t.primary} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path d="M19 12.5A7.5 7.5 0 019.5 3c0-.38.03-.75.09-1.12A8 8 0 1020 13.22 7.5 7.5 0 0119 12.5z" stroke={t.textMuted} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
