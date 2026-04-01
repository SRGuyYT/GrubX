import type { AppDataMode, Settings } from "@/types/settings";

export const DEFAULT_SETTINGS: Settings = {
  guestMode: true,
  allowPopups: false,
  autoplayTrailers: false,
  enableAnimations: true,
  dataSaver: false,
};

export const GUEST_SETTINGS_KEY = "grubx_settings_guest";
export const GUEST_WATCHLIST_KEY = "grubx_watchlist";
export const GUEST_PROGRESS_KEY = "grubx_progress";
export const GUEST_HISTORY_KEY = "grubx_history";
export const PREFERRED_MODE_KEY = "grubx_mode";

export const sanitizeSettings = (input?: Partial<Settings> | null): Settings => ({
  guestMode: input?.guestMode ?? DEFAULT_SETTINGS.guestMode,
  allowPopups: false,
  autoplayTrailers: input?.autoplayTrailers ?? DEFAULT_SETTINGS.autoplayTrailers,
  enableAnimations: input?.enableAnimations ?? DEFAULT_SETTINGS.enableAnimations,
  dataSaver: input?.dataSaver ?? DEFAULT_SETTINGS.dataSaver,
});

export const readPreferredMode = (): AppDataMode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(PREFERRED_MODE_KEY);
  if (stored === "account") {
    return "account";
  }
  if (stored === "guest") {
    return "guest";
  }
  return null;
};

export const writePreferredMode = (mode: AppDataMode) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PREFERRED_MODE_KEY, mode);
};
