"use client";

import { useTheme } from "@/lib/theme-context";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: SwitchProps) {
  const { t } = useTheme();

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        {label && (
          <p className="font-medium text-sm" style={{ color: t.text }}>
            {label}
          </p>
        )}
        {description && (
          <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>
            {description}
          </p>
        )}
      </div>

      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: checked ? t.primary : t.border,
        }}
      >
        <span
          className="inline-block h-5 w-5 transform rounded-full shadow-md transition-transform duration-200 ease-in-out"
          style={{
            background: "#FFFFFF",
            transform: checked ? "translateX(26px)" : "translateX(4px)",
          }}
        />
      </button>
    </div>
  );
}
