export interface ErrorSettings {
  autoLogErrors: boolean; // 8.4 Auto-log errors toggle
  errorNotification: boolean; // 8.4 Error notification preference
  drillSuggestion: boolean; // 8.4 Drill suggestion preference
  autoResolveThreshold: 1 | 2 | 3; // 8.4 Auto-resolve threshold setting (1, 2, 3 correct)
  soundEffects: boolean;
}

export const DEFAULT_ERROR_SETTINGS: ErrorSettings = {
  autoLogErrors: true,
  errorNotification: true,
  drillSuggestion: true,
  autoResolveThreshold: 1,
  soundEffects: true,
};

const STORAGE_KEY = "toeic_ai_error_settings";

export function getStoredErrorSettings(): ErrorSettings {
  if (typeof window === "undefined") {
    return DEFAULT_ERROR_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ERROR_SETTINGS;
    return { ...DEFAULT_ERROR_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ERROR_SETTINGS;
  }
}

export function saveStoredErrorSettings(settings: ErrorSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save error settings to localStorage", e);
  }
}
