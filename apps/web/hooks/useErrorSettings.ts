"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type ErrorSettings,
  DEFAULT_ERROR_SETTINGS,
  getStoredErrorSettings,
  saveStoredErrorSettings,
} from "@/lib/error-settings";

export function useErrorSettings() {
  const [settings, setSettings] = useState<ErrorSettings>(DEFAULT_ERROR_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettings(getStoredErrorSettings());
    setIsLoaded(true);
  }, []);

  const updateSetting = useCallback(
    <K extends keyof ErrorSettings>(key: K, value: ErrorSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        saveStoredErrorSettings(next);
        return next;
      });
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_ERROR_SETTINGS);
    saveStoredErrorSettings(DEFAULT_ERROR_SETTINGS);
  }, []);

  return {
    settings,
    isLoaded,
    updateSetting,
    resetSettings,
  };
}
