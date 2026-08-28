/**
 * Grammar Settings definition and LocalStorage helper
 */

export interface GrammarSettings {
  exerciseDifficultyPreference: "all" | "basic" | "intermediate" | "advanced";
  showExplanationsByDefault: boolean;
  autoAdvanceAfterCorrect: boolean;
  soundEffects: boolean;
}

export const DEFAULT_GRAMMAR_SETTINGS: GrammarSettings = {
  exerciseDifficultyPreference: "all",
  showExplanationsByDefault: true,
  autoAdvanceAfterCorrect: false,
  soundEffects: true,
};

const STORAGE_KEY = "toeic_grammar_settings";

export function loadGrammarSettings(): GrammarSettings {
  if (typeof window === "undefined") return DEFAULT_GRAMMAR_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GRAMMAR_SETTINGS;
    return { ...DEFAULT_GRAMMAR_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GRAMMAR_SETTINGS;
  }
}

export function saveGrammarSettings(settings: GrammarSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Save grammar settings error:", err);
  }
}

/**
 * Web Audio API synthesized sound effects
 */
export function playSoundFeedback(type: "click" | "correct" | "incorrect" | "complete"): void {
  if (typeof window === "undefined") return;
  const settings = loadGrammarSettings();
  if (!settings.soundEffects) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "correct") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "incorrect") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "complete") {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    }
  } catch (e) {
    // Ignore audio context errors if blocked by browser policy
  }
}
