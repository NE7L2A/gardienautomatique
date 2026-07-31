import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export statique requis pour Capacitor (pas de serveur Node.js)
  output: "export",
  // Les images statiques ne sont pas optimisées en mode export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
