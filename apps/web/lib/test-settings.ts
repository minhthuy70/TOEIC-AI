/**
 * Mock Test Settings definition and LocalStorage helper
 */

export interface TestSettings {
  defaultTestType: "full" | "mini";
  defaultTimeLimit: number; // in minutes (120, 90, 60, 45, 30)
  showTimer: boolean;
  allowPause: boolean;
  showRealtimeScore: boolean;
  autoSubmit: boolean;
  soundEffects: boolean;
}

export const DEFAULT_TEST_SETTINGS: TestSettings = {
  defaultTestType: "full",
  defaultTimeLimit: 120,
  showTimer: true,
  allowPause: true,
  showRealtimeScore: true,
  autoSubmit: true,
  soundEffects: true,
};

const STORAGE_KEY = "toeic_test_settings";

export function loadTestSettings(): TestSettings {
  if (typeof window === "undefined") return DEFAULT_TEST_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TEST_SETTINGS;
    return { ...DEFAULT_TEST_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TEST_SETTINGS;
  }
}

export function saveTestSettings(settings: TestSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Save test settings error:", err);
  }
}

/**
 * Web Audio API synthesized sound effects for Test System
 */
export function playTestSoundEffect(type: "warning" | "submit" | "tick" | "complete" | "click"): void {
  if (typeof window === "undefined") return;
  const settings = loadTestSettings();
  if (!settings.soundEffects) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "tick") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } else if (type === "warning") {
      // 2 short alert beeps
      [0, 0.15].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(600, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.08);
      });
    } else if (type === "submit" || type === "complete") {
      // Ascending pleasant chord
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    }
  } catch (err) {
    console.error("Audio playback error:", err);
  }
}
