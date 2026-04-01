"use client";

import { useSettingsContext } from "@/context/SettingsContext";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function GuestModeBanner() {
  const { ready, mode } = useSettingsContext();
  const [dismissed, setDismissed] = useState(false);

  if (!ready || mode !== "guest" || dismissed) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full border border-amber-500/30 bg-[#0d1117]/90 px-5 py-3 text-sm font-medium text-amber-200 shadow-[0_8px_32px_rgba(245,158,11,0.2)] backdrop-blur-xl">
        <AlertTriangle className="size-4 shrink-0 text-amber-400" />
        <span className="flex-1">You are in Guest Mode. Your data is temporary.</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-full p-1 text-amber-400/70 transition hover:bg-amber-500/20 hover:text-amber-300"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
