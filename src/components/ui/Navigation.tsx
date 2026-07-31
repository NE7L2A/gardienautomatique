"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";

const liens = [
  {
    href: "/",
    label: "Accueil",
    icone: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Notifications",
    icone: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    href: "/historique",
    label: "Historique",
    icone: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const chemin = usePathname();
  const { t } = useTheme();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 px-2 z-50 backdrop-blur-sm"
      style={{
        background: `${t.navBg}F2`,
        borderTop: `1px solid ${t.navBorder}`,
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-center justify-around py-2">
        {liens.map((lien) => {
          const actif = chemin === lien.href;
          return (
            <Link
              key={lien.href}
              href={lien.href}
              className="flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-xl transition-all duration-200"
              style={{
                color: actif ? t.primary : t.textFaint,
                background: actif ? `${t.primary}1A` : "transparent",
              }}
            >
              {lien.icone}
              <span className="text-[10px] font-medium">{lien.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
