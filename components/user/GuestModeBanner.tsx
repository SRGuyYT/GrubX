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
    <div className="page-shell pt-2 pb-1">
      <div className="liquid-glass-soft flex items-center gap-3 rounded-[1.5rem] border-amber-500/20 px-5 py-4 text-sm font-medium text-amber-100 shadow-[0_14px_38px_rgba(245,158,11,0.14)]">
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
