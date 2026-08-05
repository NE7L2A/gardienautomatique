import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serveur API — pas d'export statique
  // Racine du workspace pour éviter le warning multi-lockfiles (backend/ + racine)
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
