"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import {
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Headphones,
  BellRing,
  Smartphone,
  Moon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ListMusic,
  Check,
  Flame,
  Shield,
  Zap,
} from "lucide-react";

interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  category: string;
  audioUrl: string;
  artwork: string;
  description: string;
}

interface AudioSettingsData {
  playInBackground: boolean;
  notificationControls: boolean;
  lockScreenControls: boolean;
  headphoneControls: boolean;
  playbackRate: number;
  sleepTimerMinutes: number;
  autoPlayNext: boolean;
  loopMode: "none" | "one" | "all";
}

const DEFAULT_TRACKS: AudioTrack[] = [
  {
    id: "audio-part1-office",
    title: "Part 1: Office & Workplace Photos",
    artist: "TOEIC Master Voice (US Accent)",
    album: "TOEIC Listening Masterclass 2026",
    duration: 185,
    category: "Part 1",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/office_room.ogg",
    artwork: "/images/artwork-part1.jpg",
    description: "Mô tả hình ảnh công sở, hội thảo và môi trường văn phòng quốc tế",
  },
  {
    id: "audio-part2-qa-drill",
    title: "Part 2: Rapid Question-Response Drill",
    artist: "Sarah Jenkins & David Miller (UK/US)",
    album: "TOEIC Rapid Reflex Series",
    duration: 240,
    category: "Part 2",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    artwork: "/images/artwork-part2.jpg",
    description: "Luyện phản xạ 30 câu hỏi - đáp nhanh Wh-questions và câu hỏi gián tiếp",
  },
  {
    id: "audio-part3-business",
    title: "Part 3: Business Conversations & Meetings",
    artist: "Michael Chen & Emma Watson (US/AU)",
    album: "Corporate TOEIC Mastery",
    duration: 310,
    category: "Part 3",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/airport_gate.ogg",
    artwork: "/images/artwork-part3.jpg",
    description: "Hội thoại đàm phán hợp đồng, logistics, đặt vé và kế hoạch ngân sách",
  },
  {
    id: "audio-part4-broadcast",
    title: "Part 4: Public Announcements & Radio Reports",
    artist: "Robert Davis (US Accent)",
    album: "Advanced TOEIC 900+ Listening",
    duration: 275,
    category: "Part 4",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/train_station.ogg",
    artwork: "/images/artwork-part4.jpg",
    description: "Thông báo tại sân bay, bản tin giao thông, thời tiết và báo cáo thị trường",
  },
  {
    id: "audio-vocab-600-loop",
    title: "600 Essential Words Audio Loop (Song Ngữ)",
    artist: "AI Native Speaker & Voice Over",
    album: "TOEIC Passive Vocabulary Loop",
    duration: 420,
    category: "Vocabulary",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/outdoor_park.ogg",
    artwork: "/images/artwork-vocab.jpg",
    description: "Nghe lặp vô thức 50 chủ đề từ vựng kèm nghĩa tiếng Việt khi đi ngủ hoặc đi xe",
  },
];

const DEFAULT_SETTINGS: AudioSettingsData = {
  playInBackground: true,
  notificationControls: true,
  lockScreenControls: true,
  headphoneControls: true,
  playbackRate: 1.0,
  sleepTimerMinutes: 0,
  autoPlayNext: true,
  loopMode: "all",
};

export default function BackgroundAudioPage() {
  const [tracks, setTracks] = useState<AudioTrack[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(185);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [settings, setSettings] = useState<AudioSettingsData>(DEFAULT_SETTINGS);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"player" | "simulator" | "headphones" | "settings">("player");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Simulated Earphone Click Counter
  const [headphoneClickLogs, setHeadphoneClickLogs] = useState<string[]>([]);
  const lastClickTimeRef = useRef<number>(0);
  const clickCountRef = useRef<number>(0);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentTrack = tracks[currentTrackIndex] || DEFAULT_TRACKS[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tracksRes, settingsRes] = await Promise.all([
        apiFetch<{ success: boolean; tracks: AudioTrack[] }>("/profile/background-audio/tracks"),
        apiFetch<{ success: boolean; data: AudioSettingsData }>("/profile/background-audio/settings"),
      ]);

      if (tracksRes.success && tracksRes.tracks) {
        setTracks(tracksRes.tracks);
      }
      if (settingsRes.success && settingsRes.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data });
      }
    } catch (e) {
      console.error("Error loading audio tracks:", e);
    }
  };

  // 2 & 3: Integrate standard Media Session API with OS Notification & Lock Screen
  useEffect(() => {
    if (typeof window !== "undefined" && "mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [
          { src: "https://placehold.co/96x96/dc2626/white?text=TOEIC", sizes: "96x96", type: "image/png" },
          { src: "https://placehold.co/128x128/dc2626/white?text=TOEIC", sizes: "128x128", type: "image/png" },
          { src: "https://placehold.co/256x256/dc2626/white?text=TOEIC", sizes: "256x256", type: "image/png" },
          { src: "https://placehold.co/512x512/dc2626/white?text=TOEIC", sizes: "512x512", type: "image/png" },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        handlePrevTrack();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        handleNextTrack();
      });
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const skipTime = details.seekOffset || 10;
        setCurrentTime((prev) => Math.max(0, prev - skipTime));
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const skipTime = details.seekOffset || 10;
        setCurrentTime((prev) => Math.min(currentTrack.duration, prev + skipTime));
      });
    }
  }, [currentTrack]);

  // Audio Playback Timer Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            if (settings.loopMode === "one") {
              return 0;
            } else if (settings.autoPlayNext) {
              handleNextTrack();
              return 0;
            } else {
              setIsPlaying(false);
              return currentTrack.duration;
            }
          }
          return prev + 1;
        });
      }, 1000 / settings.playbackRate);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentTrack, settings.playbackRate, settings.loopMode, settings.autoPlayNext]);

  // Sleep Timer Countdown
  useEffect(() => {
    let sleepInterval: NodeJS.Timeout | null = null;
    if (sleepTimerRemaining !== null && sleepTimerRemaining > 0 && isPlaying) {
      sleepInterval = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsPlaying(false);
            showToast("Hẹn giờ tắt (Sleep Timer): Đã tự động dừng phát âm thanh", "success");
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (sleepInterval) clearInterval(sleepInterval);
    };
  }, [sleepTimerRemaining, isPlaying]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setCurrentTime(0);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  };

  const handleSetSleepTimer = (minutes: number) => {
    if (minutes === 0) {
      setSleepTimerRemaining(null);
      showToast("Đã tắt hẹn giờ ngủ", "success");
    } else {
      setSleepTimerRemaining(minutes * 60);
      showToast(`Đã kích hoạt hẹn giờ ngủ: tự động tắt sau ${minutes} phút`, "success");
    }
  };

  // 4: Headphone Simulation Handler
  const handleSimulateHeadphonePress = () => {
    const now = Date.now();
    const diff = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    if (diff < 400) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }

    setTimeout(() => {
      if (Date.now() - lastClickTimeRef.current >= 380) {
        const count = clickCountRef.current;
        clickCountRef.current = 0;

        if (count === 1) {
          setIsPlaying((prev) => !prev);
          addHeadphoneLog("1 Click (Phím Tai Nghe): Play / Pause");
        } else if (count === 2) {
          handleNextTrack();
          addHeadphoneLog("2 Clicks (Phím Tai Nghe): Next Track (Bài kế tiếp)");
        } else if (count >= 3) {
          handlePrevTrack();
          addHeadphoneLog("3 Clicks (Phím Tai Nghe): Previous Track (Bài trước)");
        }
      }
    }, 400);
  };

  const addHeadphoneLog = (text: string) => {
    setHeadphoneClickLogs((prev) => [
      `[${new Date().toLocaleTimeString("vi-VN")}] ${text}`,
      ...prev.slice(0, 4),
    ]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${
              toastType === "success"
                ? "bg-zinc-900 border-green-500/30 text-green-400"
                : "bg-zinc-900 border-red-500/30 text-red-400"
            }`}
          >
            {toastType === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span className="text-sm font-medium text-white">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-400" />
            <span>Âm Thanh Nền & Luyện Nghe Thụ Động</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Phát âm thanh trong nền khi tắt màn hình, điều khiển thông báo hệ điều hành, màn hình khóa và tai nghe.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {sleepTimerRemaining !== null && (
            <div className="px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Hẹn giờ: {formatTime(sleepTimerRemaining)}</span>
            </div>
          )}

          <div
            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 ${
              isPlaying
                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 animate-pulse"
                : "bg-zinc-900 border-zinc-800 text-zinc-400"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isPlaying ? "Đang phát trong nền" : "Tạm dừng"}</span>
          </div>
        </div>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("player")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "player"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Trình Phát & Danh Sách Phát</span>
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "simulator"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mô Phỏng Màn Hình Khóa & Thông Báo</span>
        </button>
        <button
          onClick={() => setActiveTab("headphones")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "headphones"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Điều Khiển Tai Nghe & Hẹn Giờ Ngủ</span>
        </button>
      </div>

      {/* TAB 1: PLAYER & PLAYLISTS (1. Play Audio in Background) */}
      {activeTab === "player" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player Card (Left 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
              {/* Track Info Display */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-xl shrink-0">
                  <Headphones className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[11px] font-bold">
                    {currentTrack.category} • TOEIC Listening
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug">{currentTrack.title}</h3>
                  <p className="text-xs text-zinc-400">{currentTrack.artist} — {currentTrack.album}</p>
                </div>
              </div>

              {/* Progress Bar & Timing */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={currentTrack.duration}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-xs text-zinc-500 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setCurrentTime((prev) => Math.max(0, prev - 10))}
                  title="Tua lùi 10s"
                  className="p-2.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePrevTrack}
                  title="Bài trước"
                  className="p-2.5 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl shadow-red-950/50 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 translate-x-0.5" />}
                </button>

                <button
                  onClick={handleNextTrack}
                  title="Bài tiếp theo"
                  className="p-2.5 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                </button>

                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      loopMode:
                        settings.loopMode === "none"
                          ? "all"
                          : settings.loopMode === "all"
                          ? "one"
                          : "none",
                    })
                  }
                  title={`Chế độ lặp: ${settings.loopMode}`}
                  className={`p-2.5 rounded-full transition-colors ${
                    settings.loopMode !== "none" ? "text-red-400 bg-red-950/30" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {settings.loopMode === "one" ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                </button>
              </div>

              {/* Bottom Quick Controls (Rate & Volume) */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                {/* Speed selector */}
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-semibold">Tốc độ phát:</span>
                  <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                    {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setSettings({ ...settings, playbackRate: rate })}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                          settings.playbackRate === rate
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-2.5 w-full sm:w-48">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-full accent-red-600 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Side Column */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-red-400" />
                  <span>Danh Sách Bài Nghe ({tracks.length})</span>
                </h3>
                <span className="text-[11px] text-zinc-500">Tự động chuyển bài</span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {tracks.map((track, idx) => {
                  const isCurrent = idx === currentTrackIndex;
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setCurrentTrackIndex(idx);
                        setCurrentTime(0);
                        setIsPlaying(true);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? "bg-red-950/30 border-red-500/50 shadow-md"
                          : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isCurrent ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className={`text-xs font-bold line-clamp-1 ${isCurrent ? "text-red-400" : "text-white"}`}>
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 line-clamp-1">{track.category}</p>
                        </div>
                      </div>

                      <span className="text-xs text-zinc-500 font-mono shrink-0">{formatTime(track.duration)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCK SCREEN & NOTIFICATION SIMULATOR (2 & 3) */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-400" />
              <span>Mô Phỏng Trực Tiếp Widget Màn Hình Khóa & Thanh Thông Báo Hệ Điều Hành</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Khi bạn chuyển tab hoặc khóa màn hình điện thoại, hệ thống tự động kích hoạt Media Session API chuẩn quốc tế:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* 2. Notification Center Simulator */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Thanh Thông Báo Hệ Thống (Notification Bar)</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Media Session API</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/60 space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        TOEIC
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{currentTrack.title}</h4>
                        <p className="text-[11px] text-zinc-400">{currentTrack.artist}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mini Progress */}
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all"
                      style={{ width: `${(currentTime / currentTrack.duration) * 100}%` }}
                    />
                  </div>

                  {/* Notification Media Buttons */}
                  <div className="flex items-center justify-between text-zinc-300 pt-1">
                    <button onClick={handlePrevTrack} className="p-1 hover:text-white">
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentTime((prev) => Math.max(0, prev - 10))} className="p-1 hover:text-white">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleTogglePlay}
                      className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
                    </button>
                    <button onClick={handleNextTrack} className="p-1 hover:text-white">
                      <SkipForward className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          loopMode: settings.loopMode === "all" ? "one" : "all",
                        })
                      }
                      className={`p-1 ${settings.loopMode !== "none" ? "text-red-400" : ""}`}
                    >
                      <Repeat className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Phone Lock Screen Simulator */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Màn Hình Khóa Điện Thoại (Lock Screen)</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">iOS / Android Ready</span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 space-y-4 text-center">
                  <div className="text-3xl font-light text-zinc-200 tracking-wider">
                    {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                  </p>

                  <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-600/80 flex items-center justify-center text-white">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white line-clamp-1">{currentTrack.title}</h5>
                        <p className="text-[10px] text-zinc-400">{currentTrack.album}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleTogglePlay}
                      className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEADPHONE CONTROLS & SLEEP TIMER (4 & Sleep Timer) */}
      {activeTab === "headphones" && (
        <div className="space-y-6">
          {/* Headphone Controls Sandbox */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">4. Điều khiển tai nghe Bluetooth & Dây (Headphone controls)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tương thích hoàn toàn với các nút bấm trên tai nghe AirPods, Galaxy Buds, Sony WH/WF và tai nghe có dây.
                </p>
              </div>
            </div>

            {/* Cheatsheet Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-red-400 text-xs font-mono font-bold inline-block mb-1">
                  1 Click (Nhấn 1 lần)
                </span>
                <h4 className="text-xs font-bold text-white">Phát / Tạm dừng (Play/Pause)</h4>
                <p className="text-[11px] text-zinc-400">Dừng hoặc tiếp tục bài nghe ngay tức khắc</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-blue-400 text-xs font-mono font-bold inline-block mb-1">
                  2 Clicks (Nhấn 2 lần)
                </span>
                <h4 className="text-xs font-bold text-white">Chuyển bài tiếp theo (Next Track)</h4>
                <p className="text-[11px] text-zinc-400">Nhảy sang bài luyện nghe kế tiếp trong danh sách</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-emerald-400 text-xs font-mono font-bold inline-block mb-1">
                  3 Clicks (Nhấn 3 lần)
                </span>
                <h4 className="text-xs font-bold text-white">Quay lại bài trước (Previous Track)</h4>
                <p className="text-[11px] text-zinc-400">Nghe lại bài hội thoại vừa xong</p>
              </div>
            </div>

            {/* Live Headphone Button Simulator */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Thử nghiệm nhấn phím tai nghe (Interactive Simulator)</h4>
                  <p className="text-[11px] text-zinc-400">
                    Nhấp vào nút bên dưới với tốc độ 1 lần, 2 lần hoặc 3 lần liên tiếp để thử nghiệm phản xạ phím.
                  </p>
                </div>

                <button
                  onClick={handleSimulateHeadphonePress}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-transform"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Bấm Nút Tai Nghe</span>
                </button>
              </div>

              {/* Click Log Display */}
              {headphoneClickLogs.length > 0 && (
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1 font-mono text-[11px] text-zinc-400">
                  {headphoneClickLogs.map((log, idx) => (
                    <div key={idx} className={idx === 0 ? "text-emerald-400 font-bold" : ""}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sleep Timer Section */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hẹn giờ ngủ tự động (Sleep Timer)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tự động dừng phát âm thanh sau khoảng thời gian định trước, lý tưởng khi nghe thụ động trước khi ngủ.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { min: 0, label: "Tắt hẹn giờ" },
                { min: 15, label: "15 phút" },
                { min: 30, label: "30 phút" },
                { min: 45, label: "45 phút" },
                { min: 60, label: "60 phút" },
              ].map((st) => (
                <button
                  key={st.min}
                  onClick={() => handleSetSleepTimer(st.min)}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                    (st.min === 0 && sleepTimerRemaining === null) ||
                    (st.min > 0 && sleepTimerRemaining !== null && Math.ceil(sleepTimerRemaining / 60) === st.min)
                      ? "bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-md"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
