"use client";

import { useEffect } from "react";
import { useTheme } from "@/lib/theme-context";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warn";
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  const { t } = useTheme();

  const couleurs = {
    success: { bg: t.success, icon: "✓" },
    error: { bg: t.danger, icon: "✕" },
    warn: { bg: t.warn, icon: "!" },
  };

  const config = couleurs[type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-toast-in"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        minWidth: 240,
        maxWidth: "90vw",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ background: config.bg }}
      >
        {config.icon}
      </div>
      <p className="text-sm font-medium flex-1" style={{ color: t.text }}>
        {message}
      </p>
      <button
        onClick={onDismiss}
        className="text-sm shrink-0"
        style={{ color: t.textMuted }}
      >
        ✕
      </button>
    </div>
  );
}
