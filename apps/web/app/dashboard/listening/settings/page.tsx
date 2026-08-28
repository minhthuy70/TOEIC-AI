"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Volume2, FileText, StickyNote, Check, RotateCcw } from "lucide-react";

const STORAGE_KEY = "listeningSettings";

interface ListeningSettings {
  defaultSpeed: number;
  defaultVolume: number;
  autoPlayNext: boolean;
  showTranscriptByDefault: boolean;
  highlightKeywords: boolean;
  autoSaveNotes: boolean;
  showTimer: boolean;
  soundEffects: boolean;
  backgroundMusic: boolean;
}

const DEFAULT_SETTINGS: ListeningSettings = {
  defaultSpeed: 1,
  defaultVolume: 1,
  autoPlayNext: false,
  showTranscriptByDefault: true,
  highlightKeywords: true,
  autoSaveNotes: true,
  showTimer: true,
  soundEffects: false,
  backgroundMusic: false,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`w-12 h-6 rounded-full transition-colors relative ${checked ? "bg-red-600" : "bg-zinc-700"}`}>
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${checked ? "left-6" : "left-0.5"}`} />
    </button>
  );
}

export default function ListeningSettingsPage() {
  const [settings, setSettings] = useState<ListeningSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const update = <K extends keyof ListeningSettings>(key: K, value: ListeningSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    setSaved(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/listening" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-red-500" />
            <span>Cài đặt luyện nghe</span>
          </h1>
          <p className="text-zinc-400 text-sm">Tùy chỉnh trải nghiệm luyện nghe của bạn</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Playback */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-red-400" />
            <span>Phát âm thanh</span>
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300">Tốc độ phát mặc định</span>
              <span className="text-white font-bold">{settings.defaultSpeed}x</span>
            </div>
            <input type="range" min="0.5" max="2" step="0.25" value={settings.defaultSpeed}
              onChange={e => update("defaultSpeed", Number(e.target.value))}
              className="w-full accent-red-500 h-1.5 rounded-lg bg-zinc-800 cursor-pointer appearance-none" />
            <div className="flex justify-between text-xs text-zinc-600"><span>0.5x</span><span>1x</span><span>2x</span></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300">Âm lượng mặc định</span>
              <span className="text-white font-bold">{Math.round(settings.defaultVolume * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={settings.defaultVolume}
              onChange={e => update("defaultVolume", Number(e.target.value))}
              className="w-full accent-red-500 h-1.5 rounded-lg bg-zinc-800 cursor-pointer appearance-none" />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-zinc-300 text-sm font-medium">Tự động phát câu tiếp theo</p><p className="text-zinc-500 text-xs">Tự động chuyển sang câu hỏi kế tiếp sau khi audio kết thúc</p></div>
            <Toggle checked={settings.autoPlayNext} onChange={() => update("autoPlayNext", !settings.autoPlayNext)} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-zinc-300 text-sm font-medium">Hiệu ứng âm thanh</p><p className="text-zinc-500 text-xs">Phát âm thanh khi trả lời đúng/sai</p></div>
            <Toggle checked={settings.soundEffects} onChange={() => update("soundEffects", !settings.soundEffects)} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-zinc-300 text-sm font-medium">Nhạc nền (Lofi)</p><p className="text-zinc-500 text-xs">Phát nhạc lofi nhẹ nhàng trong lúc làm bài</p></div>
            <Toggle checked={settings.backgroundMusic} onChange={() => update("backgroundMusic", !settings.backgroundMusic)} />
          </div>
        </div>

        {/* Transcript & Display */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-400" />
            <span>Bản ghi & Hiển thị</span>
          </h2>
          <div className="flex items-center justify-between">
            <div><p className="text-zinc-300 text-sm font-medium">Hiển thị bản ghi mặc định</p><p className="text-zinc-500 text-xs">Tự động mở transcript khi ôn tập</p></div>
            <Toggle checked={settings.showTranscriptByDefault} onChange={() => update("showTranscriptByDefault", !settings.showTranscriptByDefault)} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-zinc-300 text-sm font-medium">Highlight từ khóa</p><p className="text-zinc-500 text-xs">Tự động làm nổi bật từ khóa quan trọng trong transcript</p></div>
            <Toggle checked={settings.highlightKeywords} onChange={() => update("highlightKeywords", !settings.highlightKeywords)} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-zinc-300 text-sm font-medium">Hiển thị đồng hồ đếm ngược</p><p className="text-zinc-500 text-xs">Hiện timer ở góc màn hình khi luyện tập có giới hạn thời gian</p></div>
            <Toggle checked={settings.showTimer} onChange={() => update("showTimer", !settings.showTimer)} />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-bold flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-red-400" />
            <span>Ghi chú</span>
          </h2>
          <div className="flex items-center justify-between">
            <div><p className="text-zinc-300 text-sm font-medium">Tự động lưu ghi chú</p><p className="text-zinc-500 text-xs">Tự động lưu ghi chú sau mỗi lần chỉnh sửa</p></div>
            <Toggle checked={settings.autoSaveNotes} onChange={() => update("autoSaveNotes", !settings.autoSaveNotes)} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleSave} className={`flex-1 py-4 rounded-xl font-extrabold text-lg transition flex items-center justify-center gap-2 ${saved ? "bg-emerald-600 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}>
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                <span>Đã lưu!</span>
              </>
            ) : (
              <span>Lưu cài đặt</span>
            )}
          </button>
          <button onClick={handleReset} className="flex items-center gap-1.5 px-6 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-bold transition">
            <RotateCcw className="w-4 h-4" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>
    </div>
  );
}