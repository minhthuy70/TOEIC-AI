"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  useReadingSettingsContext,
} from "@/context/ReadingSettingsContext";
import {
  FontFamily,
  HighlightColor,
  QuestionPlacement,
  TimerStyle,
  TTSRate,
  ReadingSettings,
} from "@/hooks/useReadingSettings";
import {
  ArrowLeft,
  Settings,
  Check,
  RotateCcw,
  Type,
  Palette,
  Layout,
  Clock,
  Scroll,
  Volume2,
  Play,
  Square,
  Eye,
  Puzzle,
  FileText,
  FileCheck,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────
const FONT_FAMILIES: { value: FontFamily; label: string }[] = [
  { value: "Inter", label: "Inter (mặc định)" },
  { value: "Roboto", label: "Roboto" },
  { value: "Georgia", label: "Georgia (Serif)" },
  { value: "Merriweather", label: "Merriweather (Serif)" },
  { value: "OpenDyslexic", label: "OpenDyslexic (dễ đọc)" },
  { value: "system-ui", label: "System UI" },
];

const HIGHLIGHT_COLORS: { value: HighlightColor; label: string }[] = [
  { value: "#FFD700", label: "Vàng" },
  { value: "#90EE90", label: "Xanh lá nhạt" },
  { value: "#87CEEB", label: "Xanh da trời" },
  { value: "#FFB6C1", label: "Hồng nhạt" },
  { value: "#DDA0DD", label: "Tím nhạt" },
];

const TIMER_STYLES: { value: TimerStyle; label: string }[] = [
  { value: "digital", label: "Số (00:00)" },
  { value: "circular", label: "Tròn" },
  { value: "bar", label: "Thanh tiến độ" },
  { value: "hidden", label: "Ẩn" },
];

const TTS_RATES: { value: TTSRate; label: string }[] = [
  { value: 0.5, label: "0.5× (rất chậm)" },
  { value: 0.75, label: "0.75× (chậm)" },
  { value: 1, label: "1× (bình thường)" },
  { value: 1.25, label: "1.25× (nhanh)" },
  { value: 1.5, label: "1.5× (rất nhanh)" },
];

// ── sub-components ─────────────────────────────────────────────────────────
function SectionTitle({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 mt-2 flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </h2>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-zinc-800/50">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="sm:w-64 shrink-0">{children}</div>
    </div>
  );
}

function SliderInput({
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-indigo-500 h-1.5 rounded-full cursor-pointer bg-zinc-800"
      />
      <span className="text-xs font-bold text-indigo-300 w-12 text-right">
        {display ?? value}
      </span>
    </div>
  );
}

// ── main page ───────────────────────────────────────────────────────────────
export default function ReadingSettingsPage() {
  const { settings, updateSettings, resetSettings } =
    useReadingSettingsContext();

  const [previewText] = useState(
    "The company announced its quarterly earnings report, showing a significant increase in revenue compared to the previous year. Despite challenges in the global market, the organization maintained steady growth through strategic investments."
  );
  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [saved, setSaved] = useState(false);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available TTS voices
  useEffect(() => {
    const load = () => setTtsVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function handleUpdate(partial: Partial<ReadingSettings>) {
    updateSettings(partial);
    setSaved(false);
    clearTimeout((handleUpdate as any).__timer);
    (handleUpdate as any).__timer = setTimeout(() => setSaved(true), 600);
  }

  function handleReset() {
    resetSettings();
    setSaved(false);
    setTimeout(() => setSaved(true), 300);
  }

  function handleTTSPreview() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(previewText);
    utt.rate = settings.ttsRate;
    const voice = ttsVoices.find((v) => v.name === settings.ttsVoice);
    if (voice) utt.voice = voice;
    ttsRef.current = utt;
    window.speechSynthesis.speak(utt);
  }

  function handleTTSStop() {
    window.speechSynthesis?.cancel();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard/reading"
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              <span>Cài đặt đọc</span>
            </h1>
            <p className="text-xs text-zinc-500">
              Tùy chỉnh trải nghiệm đọc hiểu TOEIC
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 animate-pulse font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu</span>
              </span>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Settings Panel ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Typography */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <SectionTitle icon={Type}>Kiểu chữ & kích thước</SectionTitle>

            <SettingRow
              label="Cỡ chữ mặc định"
              description="Áp dụng cho toàn bộ đoạn văn đọc"
            >
              <SliderInput
                value={settings.fontSize}
                min={12}
                max={24}
                step={1}
                onChange={(v) => handleUpdate({ fontSize: v })}
                display={`${settings.fontSize}px`}
              />
            </SettingRow>

            <SettingRow
              label="Font chữ"
              description="Chọn kiểu chữ phù hợp với bạn"
            >
              <select
                value={settings.fontFamily}
                onChange={(e) =>
                  handleUpdate({ fontFamily: e.target.value as FontFamily })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </SettingRow>

            <SettingRow
              label="Khoảng cách dòng"
              description="Độ giãn dòng giúp dễ đọc hơn"
            >
              <SliderInput
                value={settings.lineHeight}
                min={1.2}
                max={2.4}
                step={0.1}
                onChange={(v) => handleUpdate({ lineHeight: v })}
                display={`${settings.lineHeight.toFixed(1)}×`}
              />
            </SettingRow>
          </div>

          {/* Highlight */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <SectionTitle icon={Palette}>Màu highlight văn bản</SectionTitle>
            <SettingRow
              label="Màu highlight"
              description="Màu dùng khi bôi đen văn bản để ghi chú"
            >
              <div className="flex gap-2 flex-wrap">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() =>
                      handleUpdate({ highlightColor: c.value })
                    }
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      settings.highlightColor === c.value
                        ? "border-white scale-110 shadow-lg"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </SettingRow>
          </div>

          {/* Display */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <SectionTitle icon={Layout}>Hiển thị câu hỏi & đồng hồ</SectionTitle>

            <SettingRow
              label="Vị trí câu hỏi"
              description="Hiển thị câu hỏi nội tuyến trong đoạn văn hoặc bên dưới"
            >
              <div className="flex gap-2">
                {(
                  [
                    { value: "below" as QuestionPlacement, label: "Bên dưới" },
                    { value: "inline" as QuestionPlacement, label: "Nội tuyến" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      handleUpdate({ questionPlacement: opt.value })
                    }
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      settings.questionPlacement === opt.value
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </SettingRow>

            <SettingRow
              label="Kiểu đồng hồ"
              description="Cách hiển thị thời gian trong bài luyện"
            >
              <div className="grid grid-cols-2 gap-2">
                {TIMER_STYLES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => handleUpdate({ timerStyle: t.value })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                      settings.timerStyle === t.value
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </SettingRow>
          </div>

          {/* Auto-scroll */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <SectionTitle icon={Scroll}>Cuộn tự động</SectionTitle>
            <SettingRow
              label="Tốc độ cuộn tự động"
              description="0 = tắt. Cuộn đoạn văn tự động khi đọc"
            >
              <SliderInput
                value={settings.autoScrollSpeed}
                min={0}
                max={10}
                step={1}
                onChange={(v) => handleUpdate({ autoScrollSpeed: v })}
                display={
                  settings.autoScrollSpeed === 0
                    ? "Tắt"
                    : `${settings.autoScrollSpeed}`
                }
              />
            </SettingRow>
          </div>

          {/* Text-to-Speech */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <SectionTitle icon={Volume2}>Văn bản thành giọng nói (TTS)</SectionTitle>

            <SettingRow
              label="Bật TTS"
              description="Cho phép đọc to đoạn văn và câu hỏi"
            >
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ttsEnabled}
                  onChange={(e) =>
                    handleUpdate({ ttsEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </SettingRow>

            {settings.ttsEnabled && (
              <>
                <SettingRow
                  label="Giọng nói"
                  description="Chọn giọng đọc từ hệ thống"
                >
                  <select
                    value={settings.ttsVoice}
                    onChange={(e) =>
                      handleUpdate({ ttsVoice: e.target.value })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Mặc định --</option>
                    {ttsVoices
                      .filter((v) => v.lang.startsWith("en"))
                      .map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                  </select>
                </SettingRow>

                <SettingRow
                  label="Tốc độ giọng đọc"
                  description="Điều chỉnh tốc độ phát âm"
                >
                  <div className="flex flex-col gap-1.5">
                    {TTS_RATES.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => handleUpdate({ ttsRate: r.value })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition text-left ${
                          settings.ttsRate === r.value
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleTTSPreview}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Nghe thử</span>
                  </button>
                  <button
                    onClick={handleTTSStop}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-xl transition"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Dừng</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Preview Panel ── */}
        <div className="space-y-4">
          <div className="sticky top-24">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trước</span>
              </h3>

              {/* Text preview */}
              <div
                className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 mb-4 leading-relaxed text-zinc-200"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  fontFamily: settings.fontFamily,
                  lineHeight: settings.lineHeight,
                }}
              >
                <span
                  style={{ backgroundColor: settings.highlightColor }}
                  className="text-black rounded px-0.5"
                >
                  The company
                </span>{" "}
                announced its quarterly earnings report, showing a{" "}
                <span
                  style={{ backgroundColor: settings.highlightColor }}
                  className="text-black rounded px-0.5"
                >
                  significant increase
                </span>{" "}
                in revenue compared to the previous year.
              </div>

              {/* Timer preview */}
              <div className="mb-4">
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">
                  Đồng hồ đếm ngược:
                </p>
                {settings.timerStyle === "digital" && (
                  <div className="text-2xl font-mono font-bold text-indigo-400">
                    05:00
                  </div>
                )}
                {settings.timerStyle === "circular" && (
                  <div className="relative w-14 h-14">
                    <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                      <circle
                        cx="18" cy="18" r="15.9"
                        fill="none" stroke="#27272a" strokeWidth="3"
                      />
                      <circle
                        cx="18" cy="18" r="15.9"
                        fill="none" stroke="#6366f1" strokeWidth="3"
                        strokeDasharray="70 30"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-400">
                      70%
                    </span>
                  </div>
                )}
                {settings.timerStyle === "bar" && (
                  <div className="w-full bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full"
                      style={{ width: "70%" }}
                    />
                  </div>
                )}
                {settings.timerStyle === "hidden" && (
                  <div className="text-xs text-zinc-500 italic">
                    Đồng hồ ẩn
                  </div>
                )}
              </div>

              {/* Question placement preview */}
              <div>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">
                  Vị trí câu hỏi:
                </p>
                {settings.questionPlacement === "below" ? (
                  <div className="space-y-1.5">
                    <div className="bg-zinc-700/40 rounded-lg h-12 flex items-center px-3 text-xs text-zinc-400">
                      Đoạn văn...
                    </div>
                    <div className="bg-indigo-900/30 border border-indigo-800/30 rounded-lg h-8 flex items-center px-3 text-xs text-indigo-300">
                      Câu hỏi bên dưới
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="bg-zinc-700/40 rounded-lg h-5 flex items-center px-3 text-xs text-zinc-400">
                      Văn bản
                    </div>
                    <div className="bg-indigo-900/30 border border-indigo-800/30 rounded-lg h-5 flex items-center px-3 text-xs text-indigo-300">
                      Câu hỏi nội tuyến
                    </div>
                    <div className="bg-zinc-700/40 rounded-lg h-5 flex items-center px-3 text-xs text-zinc-400">
                      Văn bản tiếp theo
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick navigation */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Đi đến bài luyện
              </h3>
              <div className="space-y-2">
                {[
                  { href: "/dashboard/reading/part-5", label: "Part 5 – Hoàn thành câu", icon: Puzzle },
                  { href: "/dashboard/reading/part-6", label: "Part 6 – Hoàn thành đoạn văn", icon: FileText },
                  { href: "/dashboard/reading/part-7", label: "Part 7 – Đọc hiểu", icon: FileCheck },
                  { href: "/dashboard/reading/mixed", label: "Luyện hỗn hợp", icon: SlidersHorizontal },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-xs text-zinc-300 hover:text-white transition"
                    >
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span>{link.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto text-zinc-600" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
