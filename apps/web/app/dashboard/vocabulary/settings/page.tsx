"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  VocabSettings,
  DEFAULT_VOCAB_SETTINGS,
  loadVocabSettings,
  saveVocabSettings,
} from "@/lib/vocab-settings";
import { Settings, ArrowLeft, Check, RotateCcw, Volume2, Bell, Sparkles } from "lucide-react";

// ---- Small UI helpers -------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 mt-2">
      {children}
    </h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-5">
      {children}
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && (
          <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-red-600" : "bg-zinc-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="bg-zinc-950 border border-zinc-700 hover:border-zinc-600 focus:border-red-500 text-white text-xs rounded-xl px-3 py-2 outline-none transition cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ---- Main page --------------------------------------------------------------

export default function VocabularySettingsPage() {
  const [settings, setSettings] = useState<VocabSettings>(DEFAULT_VOCAB_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadVocabSettings());
  }, []);

  function set<K extends keyof VocabSettings>(key: K, value: VocabSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveVocabSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (!confirm("Đặt lại toàn bộ về mặc định?")) return;
    setSettings(DEFAULT_VOCAB_SETTINGS);
    saveVocabSettings(DEFAULT_VOCAB_SETTINGS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleRequestNotification() {
    if (!("Notification" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ thông báo.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      set("reviewNotifications", true);
    } else {
      alert("Quyền thông báo bị từ chối. Vui lòng bật trong cài đặt trình duyệt.");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-red-500" />
            <span>Cài đặt từ vựng</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Tùy chỉnh trải nghiệm học và ôn tập từ vựng của bạn
          </p>
        </div>
        <Link
          href="/dashboard/vocabulary"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Link>
      </div>

      {/* ── LEARNING GOALS ────────────────────────────────────────── */}
      <SectionTitle>Mục tiêu học tập</SectionTitle>
      <Card>
        {/* Daily goal slider */}
        <Row
          label="Mục tiêu từ mới hàng ngày"
          description="Số từ mới bạn muốn học mỗi ngày (10 – 50)"
        >
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={settings.dailyGoal}
              onChange={(e) => set("dailyGoal", Number(e.target.value))}
              className="w-28 accent-red-500"
            />
            <span className="text-white font-bold text-sm w-8 text-right">
              {settings.dailyGoal}
            </span>
          </div>
        </Row>

        {/* Review priority */}
        <Row
          label="Ưu tiên ôn tập"
          description="Thứ tự ưu tiên giữa từ mới và từ cần ôn"
        >
          <Select
            value={settings.reviewPriority}
            onChange={(v) => set("reviewPriority", v)}
            options={[
              { value: "review_first", label: "Ôn trước, học sau" },
              { value: "new_first",    label: "Học mới trước" },
              { value: "mixed",        label: "Xen kẽ (Mixed)" },
            ]}
          />
        </Row>

        {/* Display mode */}
        <Row
          label="Chế độ hiển thị từ vựng"
          description="Giao diện mặc định khi xem danh sách từ vựng"
        >
          <Select
            value={settings.displayMode}
            onChange={(v) => set("displayMode", v)}
            options={[
              { value: "flashcard", label: "Flashcard" },
              { value: "list",      label: "Danh sách" },
            ]}
          />
        </Row>
      </Card>

      {/* ── AUDIO ─────────────────────────────────────────────────── */}
      <SectionTitle>Âm thanh & phát âm</SectionTitle>
      <Card>
        {/* Auto-play */}
        <Row
          label="Tự động phát âm thanh"
          description="Tự động phát âm khi chuyển sang từ mới"
        >
          <Toggle
            checked={settings.autoPlay}
            onChange={(v) => set("autoPlay", v)}
          />
        </Row>

        {/* Accent */}
        <Row
          label="Giọng phát âm"
          description="Chọn giọng Mỹ (US) hoặc Anh (UK)"
        >
          <div className="flex gap-2">
            {(["US", "UK"] as const).map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => set("accent", acc)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  settings.accent === acc
                    ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-900/40"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                }`}
              >
                {acc === "US" ? "Mỹ (US)" : "Anh (UK)"}
              </button>
            ))}
          </div>
        </Row>
      </Card>

      {/* ── REVIEW SCHEDULE ──────────────────────────────────────── */}
      <SectionTitle>Lịch ôn tập</SectionTitle>
      <Card>
        {/* Review time preference */}
        <Row
          label="Thời gian ôn yêu thích"
          description="Giúp hệ thống gợi ý thời điểm phù hợp để ôn tập"
        >
          <Select
            value={settings.reviewTime}
            onChange={(v) => set("reviewTime", v)}
            options={[
              { value: "morning", label: "Buổi sáng (6h–12h)" },
              { value: "evening", label: "Buổi tối (18h–23h)" },
              { value: "anytime", label: "Bất kỳ lúc nào" },
            ]}
          />
        </Row>

        {/* SRS Algorithm */}
        <Row
          label="Thuật toán SRS"
          description="Điều chỉnh khoảng thời gian giữa các lần ôn tập"
        >
          <Select
            value={settings.srsAlgorithm}
            onChange={(v) => set("srsAlgorithm", v)}
            options={[
              { value: "standard",     label: "Tiêu chuẩn (SM-2)" },
              { value: "aggressive",   label: "Tăng tốc (Aggressive)" },
              { value: "conservative", label: "Ổn định (Conservative)" },
            ]}
          />
        </Row>

        {/* Algorithm explanation */}
        <div className={`rounded-xl p-3 text-[11px] leading-relaxed border ${
          settings.srsAlgorithm === "aggressive"
            ? "bg-rose-950/30 border-rose-800/30 text-rose-300"
            : settings.srsAlgorithm === "conservative"
            ? "bg-emerald-950/30 border-emerald-800/30 text-emerald-300"
            : "bg-indigo-950/30 border-indigo-800/30 text-indigo-300"
        }`}>
          {settings.srsAlgorithm === "standard" && (
            <><strong>Tiêu chuẩn (SM-2):</strong> Khoảng cách ôn tập tăng dần theo hiệu suất. Cân bằng giữa tốc độ học và độ ghi nhớ.</>
          )}
          {settings.srsAlgorithm === "aggressive" && (
            <><strong>Tăng tốc:</strong> Khoảng cách ôn tập dài hơn, học ít lần hơn nhưng đòi hỏi ghi nhớ tốt hơn. Phù hợp với người có thời gian hạn chế.</>
          )}
          {settings.srsAlgorithm === "conservative" && (
            <><strong>Ổn định:</strong> Ôn tập thường xuyên hơn với khoảng cách ngắn hơn. Phù hợp với người muốn củng cố chắc chắn trước khi chuyển sang từ mới.</>
          )}
        </div>
      </Card>

      {/* ── NOTIFICATIONS ────────────────────────────────────────── */}
      <SectionTitle>Thông báo</SectionTitle>
      <Card>
        <Row
          label="Thông báo khi đến hạn ôn"
          description="Nhận thông báo trình duyệt khi có từ vựng cần ôn tập"
        >
          {settings.reviewNotifications ? (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-emerald-400 font-bold">Đã bật</span>
              <Toggle
                checked={true}
                onChange={() => set("reviewNotifications", false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestNotification}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Yêu cầu quyền</span>
            </button>
          )}
        </Row>

        {settings.reviewNotifications && (
          <div className="rounded-xl bg-emerald-950/30 border border-emerald-800/30 p-3 text-[11px] text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Thông báo đã được bật. Ứng dụng sẽ nhắc bạn ôn tập vào buổi{" "}
              {settings.reviewTime === "morning"
                ? "sáng"
                : settings.reviewTime === "evening"
                ? "tối"
                : "thích hợp"}
              .
            </span>
          </div>
        )}
      </Card>

      {/* ── Action Buttons ───────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-zinc-500 hover:text-rose-400 font-semibold transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại mặc định</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 ${
            saved
              ? "bg-emerald-600 text-white shadow-emerald-900/30"
              : "bg-red-600 hover:bg-red-500 text-white shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Đã lưu!</span>
            </>
          ) : (
            <span>Lưu cài đặt</span>
          )}
        </button>
      </div>
    </div>
  );
}