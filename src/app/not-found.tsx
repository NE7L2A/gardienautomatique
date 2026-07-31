"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Bouton from "@/components/ui/Bouton";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1A2332] flex flex-col items-center justify-center px-6 relative">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #FF9900 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative flex items-center gap-2 mb-8 self-start absolute top-6 left-6">
        <div className="w-8 h-8 rounded-lg bg-[#243447] flex items-center justify-center overflow-hidden ring-1 ring-[#FF9900]/20">
          <Image src="/logo.png" alt="EYESHOME" width={28} height={28} className="object-cover w-full h-full" />
        </div>
        <span className="text-white font-bold text-sm tracking-wider">EYESHOME</span>
      </div>

      <div className="relative w-20 h-20 rounded-full bg-[#243447] flex items-center justify-center ring-1 ring-[#FF9900]/20 mb-6">
        <Image
          src="/logo.png"
          alt="EYESHOME"
          width={56}
          height={56}
          className="object-contain"
        />
      </div>

      <h1 className="relative text-[#FF1744] text-6xl font-bold mb-2">404</h1>

      <h2 className="relative text-white text-xl font-bold mb-2 text-center">
        Zone non sécurisée
      </h2>
      <p className="relative text-[#94A3B8] text-sm text-center mb-8 max-w-xs leading-relaxed">
        Cette zone n&apos;est pas couverte par le réseau de capteurs. Il
        semblerait que vous vous soyez aventuré en dehors du périmètre
        protégé.
      </p>

      <div className="relative mb-8">
        <svg
          className="w-24 h-24 text-[#334155]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18"
            strokeWidth={2}
          />
        </svg>
      </div>

      <div className="relative w-full max-w-xs">
        <Bouton onClick={() => router.push("/")}>
          Retour au poste de garde
        </Bouton>
      </div>
    </div>
  );
}
