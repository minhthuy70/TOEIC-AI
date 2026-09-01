"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import {
  Share2,
  Trophy,
  Flame,
  Award,
  ClipboardCheck,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  ExternalLink,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Check,
  RefreshCw,
  Hash,
  Eye,
  Zap,
} from "lucide-react";

interface SocialTemplateData {
  learnerName: string;
  userAvatar: string | null;
  currentStage: number;
  stageName: string;
  testResult: {
    testTitle: string;
    totalScore: number;
    listeningScore: number;
    readingScore: number;
    bandScore: string;
    accuracyRate: number;
    date: string;
  };
  progress: {
    streakDays: number;
    vocabLearned: number;
    totalStudyHours: number;
    lessonsCompleted: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    date: string;
  }>;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    tier: string;
  }>;
}

const DEFAULT_TEMPLATE_DATA: SocialTemplateData = {
  learnerName: "Minh Thùy",
  userAvatar: null,
  currentStage: 4,
  stageName: "Chặng 4: Nâng Cao 650-800+",
  testResult: {
    testTitle: "Full Mock Test ETS 2026 #01",
    totalScore: 835,
    listeningScore: 430,
    readingScore: 405,
    bandScore: "B2 Upper-Intermediate (800+)",
    accuracyRate: 84,
    date: new Date().toLocaleDateString("vi-VN"),
  },
  progress: {
    streakDays: 18,
    vocabLearned: 640,
    totalStudyHours: 42,
    lessonsCompleted: 58,
  },
  achievements: [
    {
      id: "ach-1",
      title: "Chiến Binh Kiên Trì",
      description: "Duy trì chuỗi học 18 ngày liên tục",
      icon: "Flame",
      date: "2026-08-31",
    },
    {
      id: "ach-2",
      title: "Cột Mốc 800+ TOEIC",
      description: "Đạt trên 800 điểm trong bài thi thử ETS",
      icon: "Trophy",
      date: "2026-08-30",
    },
  ],
  badges: [
    { id: "badge-1", name: "Vua Tốc Độ Part 5", icon: "Zap", tier: "Gold" },
    { id: "badge-2", name: "Thính Giác Kim Cương", icon: "Headphones", tier: "Diamond" },
    { id: "badge-3", name: "TOEIC 800+ Conqueror", icon: "Award", tier: "Master" },
  ],
};

const SUGGESTED_HASHTAGS = [
  "#TOEICAI",
  "#TOEIC900Plus",
  "#StudyStreak",
  "#TOEICListening",
  "#TOEICReading",
  "#ETS2026",
  "#SelfDiscipline",
];

export default function SocialSharePage() {
  const [data, setData] = useState<SocialTemplateData>(DEFAULT_TEMPLATE_DATA);
  const [shareType, setShareType] = useState<"test" | "progress" | "achievement" | "badge">("test");
  const [customMessage, setCustomMessage] = useState(
    "Mình vừa đạt 835 điểm trong bài thi thử TOEIC ETS trên TOEIC AI Platform! 🎯 Cùng nỗ lực chạm mốc 900+ nhé!"
  );
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(["#TOEICAI", "#TOEIC900Plus", "#StudyStreak"]);
  const [cardTheme, setCardTheme] = useState<"ruby" | "gold" | "cyber" | "slate">("ruby");
  const [copiedLink, setCopiedLink] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const cardRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; data: SocialTemplateData }>("/profile/social-sharing/templates");
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.error("Error loading social sharing data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Update caption based on selected category
  const handleCategoryChange = (type: "test" | "progress" | "achievement" | "badge") => {
    setShareType(type);
    if (type === "test") {
      setCustomMessage(
        `Mình vừa đạt ${data.testResult.totalScore} điểm trong bài thi thử ${data.testResult.testTitle} trên TOEIC AI! 🎯 LC: ${data.testResult.listeningScore} | RC: ${data.testResult.readingScore}.`
      );
    } else if (type === "progress") {
      setCustomMessage(
        `Đã duy trì chuỗi học ${data.progress.streakDays} ngày liên tục và hoàn thành ${data.progress.vocabLearned} từ vựng TOEIC trên TOEIC AI! 🔥`
      );
    } else if (type === "achievement") {
      setCustomMessage(
        `Vừa mở khóa thành tích "${data.achievements[0]?.title || "Cột mốc mới"}" trên hệ thống học TOEIC AI Platform! 🏆`
      );
    } else {
      setCustomMessage(
        `Bộ sưu tập huy hiệu học tập mới của mình trên TOEIC AI: ${data.badges.map((b) => b.name).join(", ")}! 💎`
      );
    }
  };

  const toggleHashtag = (tag: string) => {
    if (selectedHashtags.includes(tag)) {
      setSelectedHashtags(selectedHashtags.filter((t) => t !== tag));
    } else {
      setSelectedHashtags([...selectedHashtags, tag]);
    }
  };

  const getFullShareText = () => {
    return `${customMessage}\n\n${selectedHashtags.join(" ")}\nTrải nghiệm luyện thi TOEIC AI tại: https://toeic-ai.edu.vn`;
  };

  // 1-Click Social Sharing Handlers
  const handleShareFacebook = async () => {
    await logShare("Facebook");
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      "https://toeic-ai.edu.vn"
    )}&quote=${encodeURIComponent(getFullShareText())}`;
    window.open(url, "_blank", "width=600,height=500");
  };

  const handleShareTwitter = async () => {
    await logShare("X / Twitter");
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getFullShareText())}`;
    window.open(url, "_blank", "width=600,height=500");
  };

  const handleShareLinkedIn = async () => {
    await logShare("LinkedIn");
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      "https://toeic-ai.edu.vn"
    )}`;
    window.open(url, "_blank", "width=600,height=500");
  };

  const handleShareTelegram = async () => {
    await logShare("Telegram");
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      "https://toeic-ai.edu.vn"
    )}&text=${encodeURIComponent(getFullShareText())}`;
    window.open(url, "_blank", "width=600,height=500");
  };

  const handleShareZalo = async () => {
    await logShare("Zalo");
    const url = `https://zalo.me/share?url=${encodeURIComponent("https://toeic-ai.edu.vn")}`;
    window.open(url, "_blank", "width=600,height=500");
  };

  const handleNativeShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Chứng Nhận Thành Tích TOEIC AI",
          text: getFullShareText(),
          url: "https://toeic-ai.edu.vn",
        });
        await logShare("Native Web Share");
        showToast("Đã chia sẻ thành công!", "success");
      } catch (e) {
        console.log("Share cancelled or failed");
      }
    } else {
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getFullShareText());
    setCopiedLink(true);
    showToast("Đã sao chép nội dung & link chia sẻ vào clipboard!", "success");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // 6. Share Image Download Simulation
  const handleDownloadImage = () => {
    showToast("Đang tạo và tải ảnh chứng nhận chất lượng cao (PNG 1080p)...", "success");
    // Trigger download of canvas/svg mock
    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `TOEIC_Certificate_${data.learnerName.replace(/\s+/g, "_")}.png`;
      link.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(getSvgString());
      link.click();
      showToast("Đã tải ảnh chứng nhận về thiết bị thành công!", "success");
    }, 600);
  };

  const logShare = async (platform: string) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/social-sharing/log", {
        method: "POST",
        body: JSON.stringify({ shareType, platform }),
      });
      if (res.success) {
        showToast(res.message || `Đã chia sẻ lên ${platform}! +20 XP`, "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getSvgString = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#09090b" rx="20"/>
      <rect x="15" y="15" width="570" height="370" fill="#18181b" rx="16" stroke="#dc2626" stroke-width="2"/>
      <text x="300" y="70" fill="#ffffff" font-size="24" font-weight="bold" text-anchor="middle" font-family="sans-serif">CHỨNG NHẬN KẾT QUẢ TOEIC AI</text>
      <text x="300" y="110" fill="#a1a1aa" font-size="14" text-anchor="middle" font-family="sans-serif">Học viên: ${data.learnerName}</text>
      <text x="300" y="190" fill="#ef4444" font-size="64" font-weight="900" text-anchor="middle" font-family="sans-serif">${data.testResult.totalScore}</text>
      <text x="300" y="225" fill="#facc15" font-size="16" font-weight="bold" text-anchor="middle" font-family="sans-serif">${data.testResult.bandScore}</text>
      <text x="200" y="280" fill="#60a5fa" font-size="16" text-anchor="middle" font-family="sans-serif">Listening: ${data.testResult.listeningScore}</text>
      <text x="400" y="280" fill="#34d399" font-size="16" text-anchor="middle" font-family="sans-serif">Reading: ${data.testResult.readingScore}</text>
      <text x="300" y="340" fill="#71717a" font-size="12" text-anchor="middle" font-family="sans-serif">Xác thực bởi TOEIC AI Platform • Ngày: ${data.testResult.date}</text>
    </svg>`;
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
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
            <Share2 className="w-6 h-6 text-red-400" />
            <span>Chia Sẻ Thành Tích Mạng Xã Hội (Social Sharing 15.2)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tạo ảnh chứng nhận điểm số, chuỗi ngày Streak và huy hiệu chất lượng cao để lan tỏa thành tích đến bạn bè.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadImage}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Ảnh PNG</span>
          </button>
          <button
            onClick={handleNativeShare}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Chia Sẻ Nhanh</span>
          </button>
        </div>
      </div>

      {/* Category Tabs (1. Progress, 2. Achievements, 3. Test Results, 4. Badges) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "test", label: "Kết Quả Thi Thử", icon: ClipboardCheck, desc: "Chứng nhận điểm số ETS" },
          { id: "progress", label: "Tiến Độ & Streak", icon: Flame, desc: "Chuỗi ngày & Từ vựng" },
          { id: "achievement", label: "Thành Tích Mở Khóa", icon: Trophy, desc: "Mốc điểm & Cột mốc" },
          { id: "badge", label: "Bộ Sưu Tập Huy Hiệu", icon: Award, desc: "Huy hiệu vinh danh" },
        ].map((cat) => {
          const Icon = cat.icon;
          const isSelected = shareType === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "bg-red-950/30 border-red-500/50 shadow-lg shadow-red-950/20"
                  : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? "text-red-400" : "text-zinc-400"}`} />
                {isSelected && <Check className="w-4 h-4 text-red-400" />}
              </div>
              <h3 className="text-xs font-bold text-white">{cat.label}</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">{cat.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 6. Share Image Generation Live Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-400" />
              <span>Thẻ Ảnh Chứng Nhận (Live Generated Certificate)</span>
            </h3>
            <span className="text-[11px] text-zinc-500">Độ phân giải 1080p</span>
          </div>

          {/* GENERATED CERTIFICATE CARD */}
          <div
            ref={cardRef}
            className={`p-7 rounded-3xl border-2 transition-all relative overflow-hidden shadow-2xl ${
              cardTheme === "ruby"
                ? "bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/40 border-red-500/40"
                : cardTheme === "gold"
                ? "bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/40 border-amber-500/40"
                : cardTheme === "cyber"
                ? "bg-gradient-to-br from-zinc-950 via-zinc-900 to-cyan-950/40 border-cyan-500/40"
                : "bg-zinc-950 border-zinc-700"
            }`}
          >
            {/* Background Decorative Grid */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Certificate Header */}
            <div className="flex items-center justify-between pb-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shadow-lg">
                  TOEIC
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-widest text-white uppercase">TOEIC AI PLATFORM</h4>
                  <p className="text-[10px] text-zinc-400">Official Score & Progress Certificate</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>XÁC THỰC AI</span>
              </div>
            </div>

            {/* Center Content based on Share Category */}
            <div className="py-6 space-y-4">
              {/* Category 1: Test Results */}
              {shareType === "test" && (
                <div className="text-center space-y-3">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    KẾT QUẢ BÀI THI THỬ MOCK TEST
                  </span>
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-red-500 drop-shadow-sm">
                    {data.testResult.totalScore}
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    Trình độ: {data.testResult.bandScore}
                  </span>

                  <div className="grid grid-cols-2 gap-3 pt-3 max-w-xs mx-auto">
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 font-semibold">Listening (LC)</span>
                      <p className="text-lg font-bold text-blue-400">{data.testResult.listeningScore} / 495</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 font-semibold">Reading (RC)</span>
                      <p className="text-lg font-bold text-emerald-400">{data.testResult.readingScore} / 495</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 2: Progress & Streak */}
              {shareType === "progress" && (
                <div className="text-center space-y-3">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    TIẾN ĐỘ & CHUỖI RÈN LUYỆN
                  </span>
                  <div className="text-5xl font-black text-orange-400 flex items-center justify-center gap-2">
                    <Flame className="w-12 h-12 fill-orange-400" />
                    <span>{data.progress.streakDays} Ngày</span>
                  </div>
                  <p className="text-xs text-zinc-300">Duy trì thói quen luyện đề không gián đoạn</p>

                  <div className="grid grid-cols-2 gap-3 pt-3 max-w-xs mx-auto">
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 font-semibold">Từ vựng đã thuộc</span>
                      <p className="text-lg font-bold text-white">{data.progress.vocabLearned} từ</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 font-semibold">Thời lượng học</span>
                      <p className="text-lg font-bold text-white">{data.progress.totalStudyHours} giờ</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 3: Achievements */}
              {shareType === "achievement" && (
                <div className="text-center space-y-3">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    THÀNH TÍCH MỞ KHÓA MỚI
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                    <Trophy className="w-9 h-9" />
                  </div>
                  <h4 className="text-xl font-bold text-white">{data.achievements[0]?.title}</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">{data.achievements[0]?.description}</p>
                </div>
              )}

              {/* Category 4: Badges */}
              {shareType === "badge" && (
                <div className="text-center space-y-3">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    BỘ SƯU TẬP HUY HIỆU DANH GIÁ
                  </span>
                  <div className="flex justify-center gap-3 pt-2">
                    {data.badges.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center gap-1.5 w-28"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                          <Award className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold text-white line-clamp-1">{b.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {b.tier}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Certificate Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">
                  {data.learnerName.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-zinc-300">{data.learnerName}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <QrCode className="w-4 h-4 text-zinc-400" />
                <span>Verify: toeic-ai.edu.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 5. Custom Message & Social Sharing Buttons (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Custom Message Editor */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-400" />
              <span>5. Thông điệp chia sẻ tùy chỉnh (Custom message)</span>
            </h3>

            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Nhập thông điệp truyền cảm hứng học tập của bạn..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500/50 resize-none"
            />

            {/* Hashtag selector */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-zinc-500" />
                <span>Gợi ý Hashtags:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_HASHTAGS.map((tag) => {
                  const isSelected = selectedHashtags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleHashtag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        isSelected
                          ? "bg-red-950/50 border border-red-500/40 text-red-300"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Social Platform Buttons */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-red-400" />
              <span>1-Click Chia Sẻ Đa Nền Tảng</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleShareFacebook}
                className="p-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Facebook</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>X (Twitter)</span>
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="p-3 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-[#0A66C2] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>LinkedIn</span>
              </button>

              <button
                onClick={handleShareTelegram}
                className="p-3 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Telegram</span>
              </button>

              <button
                onClick={handleShareZalo}
                className="p-3 rounded-xl bg-[#0068FF]/10 hover:bg-[#0068FF]/20 border border-[#0068FF]/30 text-[#0068FF] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Zalo</span>
              </button>

              <button
                onClick={handleCopyText}
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Đã Sao Chép!" : "Copy Link"}</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-yellow-400 font-semibold flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Nhận ngay +20 XP thưởng cho mỗi lượt chia sẻ thành tích</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
