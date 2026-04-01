"use client";

import { useSettingsContext } from "@/context/SettingsContext";

export function GuestModeBanner() {
  const { ready, mode } = useSettingsContext();

  if (!ready || mode !== "guest") {
    return null;
  }

  return (
    <div className="page-shell pt-4">
      <div className="liquid-glass-soft rounded-full px-4 py-3 text-center text-sm text-[var(--muted)]">
        You are in Guest Mode. Your data is temporary.
      </div>
    </div>
  );
}
