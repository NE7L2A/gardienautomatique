import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export statique requis pour Capacitor (pas de serveur Node.js)
  output: "export",
  // Les images statiques ne sont pas optimisées en mode export
  images: {
    unoptimized: true,
  },
  // Détecte la racine du projet pour éviter que Next 16 ne détecte backend/ (workspace)
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
