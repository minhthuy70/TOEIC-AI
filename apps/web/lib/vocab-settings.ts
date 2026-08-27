/**
 * Vocabulary Settings
 * Stored in localStorage under the key "vocabSettings".
 */

export interface VocabSettings {
  dailyGoal: number;
  reviewPriority: "review_first" | "new_first" | "mixed";
  autoPlay: boolean;
  accent: "US" | "UK";
  displayMode: "flashcard" | "list";
  reviewTime: "morning" | "evening" | "anytime";
  srsAlgorithm: "standard" | "aggressive" | "conservative";
  reviewNotifications: boolean;
}

export const DEFAULT_VOCAB_SETTINGS: VocabSettings = {
  dailyGoal: 20,
  reviewPriority: "review_first",
  autoPlay: true,
  accent: "US",
  displayMode: "flashcard",
  reviewTime: "anytime",
  srsAlgorithm: "standard",
  reviewNotifications: false,
};

const STORAGE_KEY = "vocabSettings";

export function loadVocabSettings(): VocabSettings {
  if (typeof window === "undefined") return DEFAULT_VOCAB_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VOCAB_SETTINGS;
    return { ...DEFAULT_VOCAB_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_VOCAB_SETTINGS;
  }
}

export function saveVocabSettings(settings: VocabSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
