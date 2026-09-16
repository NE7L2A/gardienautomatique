import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EYESHOME — API",
  description: "Backend API du système de sécurité domestique EYESHOME",
};

export default function Racine({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
