"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  VocabSettings,
  DEFAULT_VOCAB_SETTINGS,
  loadVocabSettings,
  saveVocabSettings,
} from "@/lib/vocab-settings";

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
        checked ? "bg-indigo-600" : "bg-zinc-700"
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
      className="bg-zinc-950 border border-zinc-700 hover:border-zinc-600 focus:border-indigo-500 text-white text-xs rounded-xl px-3 py-2 outline-none transition cursor-pointer"
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
    if (!confirm("Reset toÃ n bá»™ vá» máº·c Ä‘á»‹nh?")) return;
    setSettings(DEFAULT_VOCAB_SETTINGS);
    saveVocabSettings(DEFAULT_VOCAB_SETTINGS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleRequestNotification() {
    if (!("Notification" in window)) {
      alert("TrÃ¬nh duyá»‡t cá»§a báº¡n khÃ´ng há»— trá»£ thÃ´ng bÃ¡o.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      set("reviewNotifications", true);
    } else {
      alert("Quyá»n thÃ´ng bÃ¡o bá»‹ tá»« chá»‘i. Vui lÃ²ng báº­t trong cÃ i Ä‘áº·t trÃ¬nh duyá»‡t.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">&#9881;&#65039; CÃ i Ä‘áº·t tá»« vá»±ng</h1>
          <p className="text-zinc-400 text-sm mt-1">
            TÃ¹y chá»‰nh tráº£i nghiá»‡m há»c vÃ  Ã´n táº­p tá»« vá»±ng cá»§a báº¡n
          </p>
        </div>
        <Link
          href="/dashboard/vocabulary"
          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
        >
          &#8592; Quay láº¡i
        </Link>
      </div>

      {/* â”€â”€ LEARNING GOALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionTitle>Má»¥c tiÃªu há»c táº­p</SectionTitle>
      <Card>
        {/* Daily goal slider */}
        <Row
          label="Má»¥c tiÃªu tá»« má»›i hÃ ng ngÃ y"
          description="Sá»‘ tá»« má»›i báº¡n muá»‘n há»c má»—i ngÃ y (10 â€“ 50)"
        >
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={settings.dailyGoal}
              onChange={(e) => set("dailyGoal", Number(e.target.value))}
              className="w-28 accent-indigo-500"
            />
            <span className="text-white font-bold text-sm w-8 text-right">
              {settings.dailyGoal}
            </span>
          </div>
        </Row>

        {/* Review priority */}
        <Row
          label="Æ¯u tiÃªn Ã´n táº­p"
          description="Thá»© tá»± Æ°u tiÃªn giá»¯a tá»« má»›i vÃ  tá»« cáº§n Ã´n"
        >
          <Select
            value={settings.reviewPriority}
            onChange={(v) => set("reviewPriority", v)}
            options={[
              { value: "review_first", label: "Ã”n trÆ°á»›c, há»c sau" },
              { value: "new_first",    label: "Há»c má»›i trÆ°á»›c" },
              { value: "mixed",        label: "Xen káº½ (Mixed)" },
            ]}
          />
        </Row>

        {/* Display mode */}
        <Row
          label="Cháº¿ Ä‘á»™ hiá»ƒn thá»‹ tá»« vá»±ng"
          description="Giao diá»‡n máº·c Ä‘á»‹nh khi xem danh sÃ¡ch tá»« vá»±ng"
        >
          <Select
            value={settings.displayMode}
            onChange={(v) => set("displayMode", v)}
            options={[
              { value: "flashcard", label: "Flashcard" },
              { value: "list",      label: "Danh sÃ¡ch" },
            ]}
          />
        </Row>
      </Card>

      {/* â”€â”€ AUDIO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionTitle>Ã‚m thanh & phÃ¡t Ã¢m</SectionTitle>
      <Card>
        {/* Auto-play */}
        <Row
          label="Tá»± Ä‘á»™ng phÃ¡t Ã¢m thanh"
          description="Tá»± Ä‘á»™ng phÃ¡t Ã¢m khi chuyá»ƒn sang tá»« má»›i"
        >
          <Toggle
            checked={settings.autoPlay}
            onChange={(v) => set("autoPlay", v)}
          />
        </Row>

        {/* Accent */}
        <Row
          label="Giá»ng phÃ¡t Ã¢m"
          description="Chá»n giá»ng Má»¹ (US) hoáº·c Anh (UK)"
        >
          <div className="flex gap-2">
            {(["US", "UK"] as const).map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => set("accent", acc)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  settings.accent === acc
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/40"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                }`}
              >
                {acc === "US" ? "&#127482;&#127480; Má»¹" : "&#127468;&#127463; Anh"}
              </button>
            ))}
          </div>
        </Row>
      </Card>

      {/* â”€â”€ REVIEW SCHEDULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionTitle>Lá»‹ch Ã´n táº­p</SectionTitle>
      <Card>
        {/* Review time preference */}
        <Row
          label="Thá»i gian Ã´n yÃªu thÃ­ch"
          description="GiÃºp há»‡ thá»‘ng gá»£i Ã½ thá»i Ä‘iá»ƒm phÃ¹ há»£p Ä‘á»ƒ Ã´n táº­p"
        >
          <Select
            value={settings.reviewTime}
            onChange={(v) => set("reviewTime", v)}
            options={[
              { value: "morning", label: "Buá»•i sÃ¡ng (6hâ€“12h)" },
              { value: "evening", label: "Buá»•i tá»‘i (18hâ€“23h)" },
              { value: "anytime", label: "Báº¥t ká»³ lÃºc nÃ o" },
            ]}
          />
        </Row>

        {/* SRS Algorithm */}
        <Row
          label="Thuáº­t toÃ¡n SRS"
          description="Äiá»u chá»‰nh khoáº£ng thá»i gian giá»¯a cÃ¡c láº§n Ã´n táº­p"
        >
          <Select
            value={settings.srsAlgorithm}
            onChange={(v) => set("srsAlgorithm", v)}
            options={[
              { value: "standard",     label: "TiÃªu chuáº©n (SM-2)" },
              { value: "aggressive",   label: "TÄƒng tá»‘c (Aggressive)" },
              { value: "conservative", label: "á»”n Ä‘á»‹nh (Conservative)" },
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
            <><strong>TiÃªu chuáº©n (SM-2):</strong> Khoáº£ng cÃ¡ch Ã´n táº­p tÄƒng dáº§n theo hiá»‡u suáº¥t. CÃ¢n báº±ng giá»¯a tá»‘c Ä‘á»™ há»c vÃ  Ä‘á»™ ghi nhá»›.</>
          )}
          {settings.srsAlgorithm === "aggressive" && (
            <><strong>TÄƒng tá»‘c:</strong> Khoáº£ng cÃ¡ch Ã´n táº­p dÃ i hÆ¡n, há»c Ã­t láº§n hÆ¡n nhÆ°ng Ä‘Ã²i há»i ghi nhá»› tá»‘t hÆ¡n. PhÃ¹ há»£p vá»›i ngÆ°á»i cÃ³ thá»i gian háº¡n cháº¿.</>
          )}
          {settings.srsAlgorithm === "conservative" && (
            <><strong>á»”n Ä‘á»‹nh:</strong> Ã”n táº­p thÆ°á»ng xuyÃªn hÆ¡n vá»›i khoáº£ng cÃ¡ch ngáº¯n hÆ¡n. PhÃ¹ há»£p vá»›i ngÆ°á»i muá»‘n cá»§ng cá»‘ cháº¯c cháº¯n trÆ°á»›c khi chuyá»ƒn sang tá»« má»›i.</>
          )}
        </div>
      </Card>

      {/* â”€â”€ NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionTitle>ThÃ´ng bÃ¡o</SectionTitle>
      <Card>
        <Row
          label="ThÃ´ng bÃ¡o khi Ä‘áº¿n háº¡n Ã´n"
          description="Nháº­n thÃ´ng bÃ¡o trÃ¬nh duyá»‡t khi cÃ³ tá»« vá»±ng cáº§n Ã´n táº­p"
        >
          {settings.reviewNotifications ? (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-emerald-400 font-bold">ÄÃ£ báº­t</span>
              <Toggle
                checked={true}
                onChange={() => set("reviewNotifications", false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestNotification}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition"
            >
              YÃªu cáº§u quyá»n
            </button>
          )}
        </Row>

        {settings.reviewNotifications && (
          <div className="rounded-xl bg-emerald-950/30 border border-emerald-800/30 p-3 text-[11px] text-emerald-300">
            &#9989; ThÃ´ng bÃ¡o Ä‘Ã£ Ä‘Æ°á»£c báº­t. á»¨ng dá»¥ng sáº½ nháº¯c báº¡n Ã´n táº­p vÃ o buá»•i{" "}
            {settings.reviewTime === "morning"
              ? "sÃ¡ng"
              : settings.reviewTime === "evening"
              ? "tá»‘i"
              : "thÃ­ch há»£p"}
            .
          </div>
        )}
      </Card>

      {/* â”€â”€ Action Buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-zinc-500 hover:text-rose-400 font-semibold transition"
        >
          &#8635; Äáº·t láº¡i máº·c Ä‘á»‹nh
        </button>

        <button
          type="button"
          onClick={handleSave}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
            saved
              ? "bg-emerald-600 text-white shadow-emerald-900/30"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30 hover:shadow-indigo-900/50 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {saved ? "&#10003; ÄÃ£ lÆ°u!" : "LÆ°u cÃ i Ä‘áº·t"}
        </button>
      </div>
    </div>
  );
}