import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Protecteur — API",
  description: "Backend API du système de sécurité domestique Protecteur",
};

export default function Racine({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
