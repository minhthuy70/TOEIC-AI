"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GrammarSettings,
  DEFAULT_GRAMMAR_SETTINGS,
  loadGrammarSettings,
  saveGrammarSettings,
} from "@/lib/grammar-settings";

export function useGrammarSettings() {
  const [settings, setSettings] = useState<GrammarSettings>(DEFAULT_GRAMMAR_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadGrammarSettings();
    setSettings(saved);
    setLoaded(true);
  }, []);

  const updateSettings = useCallback((partial: Partial<GrammarSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveGrammarSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_GRAMMAR_SETTINGS);
    saveGrammarSettings(DEFAULT_GRAMMAR_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings, loaded };
}
