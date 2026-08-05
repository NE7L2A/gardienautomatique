"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1A2332] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Fond subtil avec pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #FF9900 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Lueur derrière le logo */}
      <div className="absolute w-64 h-64 rounded-full bg-[#FF9900]/5 blur-3xl" />

      <div className="relative animate-rebond">
        <div className="w-32 h-32 rounded-2xl bg-[#243447] flex items-center justify-center shadow-[0_0_40px_rgba(255,153,0,0.15)] ring-1 ring-[#FF9900]/20">
          <Image
            src="/logo.png"
            alt="EYESHOME"
            width={96}
            height={96}
            className="object-contain"
            priority
          />
        </div>
      </div>

      <h1 className="relative text-white text-3xl font-bold mt-8 tracking-wider">
        EYESHOME
      </h1>
      <p className="relative text-[#FF9900] text-sm mt-2 font-medium">
        Votre sécurité intelligente
      </p>

      <div className="relative mt-12 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#FF9900]/30 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-[#FF9900]/50 animate-pulse [animation-delay:0.2s]" />
        <div className="w-2 h-2 rounded-full bg-[#FF9900]/80 animate-pulse [animation-delay:0.4s]" />
      </div>
    </div>
  );
}
