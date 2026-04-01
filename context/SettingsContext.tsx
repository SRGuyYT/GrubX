"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { dataLayer } from "@/lib/dataLayer";
import { DEFAULT_SETTINGS, readPreferredMode, writePreferredMode } from "@/lib/settings";
import { useSession } from "@/context/SessionContext";
import type { AppDataMode, Settings, SettingsScope } from "@/types/settings";

type SettingsContextValue = {
  ready: boolean;
  mode: AppDataMode;
  scope: SettingsScope;
  settings: Settings;
  updateSettings(next: Partial<Settings>): Promise<void>;
  setGuestMode(enabled: boolean): Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const buildScope = (mode: AppDataMode, uid: string | null): SettingsScope =>
  mode === "account" && uid ? { mode: "account", uid } : { mode: "guest" };

export function SettingsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { initialized, session } = useSession();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<AppDataMode>("guest");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    let cancelled = false;
    const bootstrap = async () => {
      setReady(false);

      const canUseAccount = session.status === "authenticated" && !!session.firebaseUid;
      const preferredMode = canUseAccount ? readPreferredMode() : "guest";
      const nextMode =
        canUseAccount && preferredMode !== "guest"
          ? "account"
          : canUseAccount && preferredMode === "guest"
            ? "guest"
            : "guest";
      const nextScope = buildScope(nextMode, session.firebaseUid);
      const loadedSettings = await dataLayer.loadSettings(nextScope);
      const resolvedSettings =
        nextMode === "guest"
          ? { ...loadedSettings, guestMode: true, allowPopups: false as const }
          : { ...loadedSettings, guestMode: false, allowPopups: false as const };

      if (cancelled) {
        return;
      }

      setMode(nextMode);
      setSettings(resolvedSettings);
      setReady(true);
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [initialized, session.firebaseUid, session.status]);

  const scope = useMemo(() => buildScope(mode, session.firebaseUid), [mode, session.firebaseUid]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ready,
      mode,
      scope,
      settings,
      async updateSettings(next) {
        const merged =
          mode === "guest"
            ? { ...settings, ...next, guestMode: true, allowPopups: false as const }
            : { ...settings, ...next, guestMode: false, allowPopups: false as const };
        const persisted = await dataLayer.saveSettings(scope, merged);
        setSettings(
          mode === "guest"
            ? { ...persisted, guestMode: true, allowPopups: false as const }
            : { ...persisted, guestMode: false, allowPopups: false as const },
        );
      },
      async setGuestMode(enabled) {
        if (!enabled && !(session.status === "authenticated" && session.firebaseUid)) {
          return;
        }

        setReady(false);
        const nextMode: AppDataMode = enabled ? "guest" : "account";
        writePreferredMode(nextMode);
        dataLayer.clearModeScopedCache(queryClient, mode);
        const nextScope = buildScope(nextMode, session.firebaseUid);
        const loadedSettings = await dataLayer.loadSettings(nextScope);
        setMode(nextMode);
        setSettings(
          nextMode === "guest"
            ? { ...loadedSettings, guestMode: true, allowPopups: false as const }
            : { ...loadedSettings, guestMode: false, allowPopups: false as const },
        );
        setReady(true);
      },
    }),
    [mode, queryClient, ready, scope, session.firebaseUid, session.status, settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext must be used inside SettingsProvider.");
  }
  return context;
};
