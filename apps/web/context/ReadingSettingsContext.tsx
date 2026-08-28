"use client";

import React, { createContext, useContext } from "react";
import {
  useReadingSettings,
  ReadingSettings,
  DEFAULT_READING_SETTINGS,
} from "@/hooks/useReadingSettings";

interface ReadingSettingsContextValue {
  settings: ReadingSettings;
  updateSettings: (partial: Partial<ReadingSettings>) => void;
  resetSettings: () => void;
  loaded: boolean;
}

const ReadingSettingsContext = createContext<ReadingSettingsContextValue>({
  settings: DEFAULT_READING_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
  loaded: false,
});

export function ReadingSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, updateSettings, resetSettings, loaded } =
    useReadingSettings();

  return (
    <ReadingSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings, loaded }}
    >
      {children}
    </ReadingSettingsContext.Provider>
  );
}

export function useReadingSettingsContext() {
  return useContext(ReadingSettingsContext);
}
