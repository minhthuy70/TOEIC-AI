"use client";

import { useState, useEffect, useCallback } from "react";

export type FontFamily =
  | "Inter"
  | "Roboto"
  | "Georgia"
  | "Merriweather"
  | "OpenDyslexic"
  | "system-ui";

export type HighlightColor =
  | "#FFD700"
  | "#90EE90"
  | "#87CEEB"
  | "#FFB6C1"
  | "#DDA0DD";

export type QuestionPlacement = "inline" | "below";
export type TimerStyle = "digital" | "circular" | "bar" | "hidden";
export type TTSRate = 0.5 | 0.75 | 1 | 1.25 | 1.5;
export type TTSVoice = string;

export interface ReadingSettings {
  fontSize: number; // 12–24 px
  fontFamily: FontFamily;
  lineHeight: number; // 1.2–2.4
  highlightColor: HighlightColor;
  autoScrollSpeed: number; // 0 = off, 1–10
  questionPlacement: QuestionPlacement;
  timerStyle: TimerStyle;
  ttsEnabled: boolean;
  ttsRate: TTSRate;
  ttsVoice: TTSVoice;
}

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  fontSize: 16,
  fontFamily: "Inter",
  lineHeight: 1.6,
  highlightColor: "#FFD700",
  autoScrollSpeed: 0,
  questionPlacement: "below",
  timerStyle: "digital",
  ttsEnabled: false,
  ttsRate: 1,
  ttsVoice: "",
};

const STORAGE_KEY = "toeic_reading_settings";

export function useReadingSettings() {
  const [settings, setSettings] = useState<ReadingSettings>(
    DEFAULT_READING_SETTINGS
  );
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ReadingSettings>;
        setSettings({ ...DEFAULT_READING_SETTINGS, ...parsed });
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Apply CSS variables whenever settings change
  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    root.style.setProperty("--reading-font-size", `${settings.fontSize}px`);
    root.style.setProperty("--reading-font-family", settings.fontFamily);
    root.style.setProperty(
      "--reading-line-height",
      `${settings.lineHeight}`
    );
    root.style.setProperty(
      "--reading-highlight-color",
      settings.highlightColor
    );
  }, [settings, loaded]);

  const updateSettings = useCallback(
    (partial: Partial<ReadingSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore storage errors
        }
        return next;
      });
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_READING_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { settings, updateSettings, resetSettings, loaded };
}
