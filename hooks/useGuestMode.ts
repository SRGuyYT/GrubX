"use client";

import { useSettingsContext } from "@/context/SettingsContext";

export const useGuestMode = () => {
  const { mode, setGuestMode, settings } = useSettingsContext();
  return {
    isGuestMode: mode === "guest",
    guestMode: settings.guestMode,
    setGuestMode,
  };
};
