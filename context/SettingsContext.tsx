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
  error: string | null;
  mode: AppDataMode;
  scope: SettingsScope;
  settings: Settings;
  updateSettings(next: Partial<Settings>): Promise<void>;
  setGuestMode(enabled: boolean): Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const buildScope = (mode: AppDataMode, uid: string | null): SettingsScope =>
  mode === "account" && uid ? { mode: "account", uid } : { mode: "guest" };

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const loadSettingsWithRetry = async (scope: SettingsScope) => {
  try {
    return await dataLayer.loadSettings(scope);
  } catch (error) {
    if (scope.mode !== "account") {
      throw error;
    }

    await wait(450);
    return dataLayer.loadSettings(scope);
  }
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { initialized, session } = useSession();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const nextMode: AppDataMode = canUseAccount ? (preferredMode === "guest" ? "guest" : "account") : "guest";
      const nextScope = buildScope(nextMode, session.firebaseUid);
      try {
        const loadedSettings = await loadSettingsWithRetry(nextScope);
        const resolvedSettings =
          nextMode === "guest"
            ? { ...loadedSettings, guestMode: true }
            : { ...loadedSettings, guestMode: false };

        if (cancelled) {
          return;
        }

        setMode(nextMode);
        setSettings(resolvedSettings);
        setError(null);
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        setMode(nextMode);
        setSettings(
          nextMode === "guest"
            ? { ...DEFAULT_SETTINGS, guestMode: true }
            : { ...DEFAULT_SETTINGS, guestMode: false },
        );
        setError(caughtError instanceof Error ? caughtError.message : "Settings could not be loaded.");
      }
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
      error,
      mode,
      scope,
      settings,
      async updateSettings(next) {
        const merged =
          mode === "guest"
            ? { ...settings, ...next, guestMode: true }
            : { ...settings, ...next, guestMode: false };
        try {
          const persisted = await dataLayer.saveSettings(scope, merged);
          setSettings(
            mode === "guest"
              ? { ...persisted, guestMode: true }
              : { ...persisted, guestMode: false },
          );
          setError(null);
        } catch (caughtError) {
          setError(caughtError instanceof Error ? caughtError.message : "Settings could not be saved.");
          throw caughtError;
        }
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
        try {
          const loadedSettings = await loadSettingsWithRetry(nextScope);
          setMode(nextMode);
          setSettings(
            nextMode === "guest"
              ? { ...loadedSettings, guestMode: true }
              : { ...loadedSettings, guestMode: false },
          );
          setError(null);
        } catch (caughtError) {
          setMode(nextMode);
          setSettings(
            nextMode === "guest"
              ? { ...DEFAULT_SETTINGS, guestMode: true }
              : { ...DEFAULT_SETTINGS, guestMode: false },
          );
          setError(caughtError instanceof Error ? caughtError.message : "Mode settings could not be loaded.");
        } finally {
          setReady(true);
        }
      },
    }),
    [error, mode, queryClient, ready, scope, session.firebaseUid, session.status, settings],
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
