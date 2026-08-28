"use client";

import { useEffect, useState } from "react";
import {
  TestSettings,
  DEFAULT_TEST_SETTINGS,
  loadTestSettings,
  saveTestSettings,
} from "@/lib/test-settings";

export function useTestSettings() {
  const [settings, setSettings] = useState<TestSettings>(DEFAULT_TEST_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadTestSettings());
    setLoaded(true);
  }, []);

  const updateSettings = (partial: Partial<TestSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveTestSettings(updated);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_TEST_SETTINGS);
    saveTestSettings(DEFAULT_TEST_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    loaded,
  };
}
