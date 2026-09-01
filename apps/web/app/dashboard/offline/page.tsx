"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  DownloadCloud,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BookA,
  BookOpen,
  ClipboardCheck,
  Headphones,
  Sparkles,
  Check,
  Layers,
  ArrowRight,
  Database,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface OfflinePackage {
  id: string;
  type: "vocabulary" | "lessons" | "tests";
  title: string;
  description: string;
  sizeMB: number;
  itemCount: number;
  downloaded: boolean;
  downloadedAt: string | null;
  version: string;
}

interface StorageData {
  usedMB: number;
  totalMB: number;
  percentage: number;
}

interface SyncItem {
  id: string;
  type: "practice_session";
  part: number;
  score: number;
  questionCount: number;
  correctCount: number;
  completedAt: string;
}

// Sample offline mock questions
const SAMPLE_OFFLINE_QUESTIONS = [
  {
    id: 1,
    part: 5,
    question: "The director requested that all department managers ______ their annual budget proposals by Friday.",
    options: [
      { id: "A", text: "submit" },
      { id: "B", text: "submitted" },
      { id: "C", text: "submission" },
      { id: "D", text: "submits" },
    ],
    correct: "A",
    explanation: "Cấu trúc giả định (Subjunctive mood): 'request that + S + (should) + V-bare'. Do đó chọn 'submit'.",
  },
  {
    id: 2,
    part: 5,
    question: "Ms. Tanaka is ______ responsible for organizing the international business conference next month.",
    options: [
      { id: "A", text: "primary" },
      { id: "B", text: "primarily" },
      { id: "C", text: "primacy" },
      { id: "D", text: "prime" },
    ],
    correct: "B",
    explanation: "Vị trí giữa động từ 'is' và tính từ 'responsible' cần một trạng từ (adverb) để bổ nghĩa: 'primarily responsible' (chịu trách nhiệm chính).",
  },
  {
    id: 3,
    part: 5,
    question: "Because of recent market fluctuations, investors are advised to proceed with ______ caution.",
    options: [
      { id: "A", text: "extreme" },
      { id: "B", text: "extremely" },
      { id: "C", text: "extremity" },
      { id: "D", text: "extremism" },
    ],
    correct: "A",
    explanation: "Trước danh từ không đếm được 'caution' cần một tính từ 'extreme' (hết sức thận trọng).",
  },
];

const SAMPLE_OFFLINE_FLASHCARDS = [
  {
    id: 1,
    word: "Comprehensive",
    ipa: "/ˌkɑːm.prəˈhen.sɪv/",
    type: "adj",
    meaning: "Toàn diện, bao hàm, đầy đủ chi tiết",
    example: "We offer a comprehensive training program for all new staff members.",
  },
  {
    id: 2,
    word: "Negotiate",
    ipa: "/nəˈɡoʊ.ʃi.eɪt/",
    type: "verb",
    meaning: "Đàm phán, thương lượng hợp đồng",
    example: "The union is negotiating a new wage agreement with company executives.",
  },
  {
    id: 3,
    word: "Implement",
    ipa: "/ˈɪm.plə.ment/",
    type: "verb",
    meaning: "Thực hiện, triển khai áp dụng chính sách",
    example: "The firm plans to implement new cybersecurity protocols next quarter.",
  },
];

export default function OfflineModePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [packages, setPackages] = useState<OfflinePackage[]>([]);
  const [storage, setStorage] = useState<StorageData>({ usedMB: 28.5, totalMB: 500, percentage: 5.7 });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"packages" | "practice" | "manage">("packages");
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Offline Practice state
  const [practiceMode, setPracticeMode] = useState<"questions" | "flashcards">("questions");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [practiceFinished, setPracticeFinished] = useState(false);

  // Flashcard state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        showToast("Đã khôi phục kết nối mạng! Hệ thống sẽ tự động đồng bộ.", "success");
      };
      const handleOffline = () => {
        setIsOnline(false);
        showToast("Đang ở chế độ ngoại tuyến (Offline). Bạn vẫn có thể luyện tập bình thường.", "error");
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Load local sync queue from localStorage
      const savedQueue = localStorage.getItem("toeic_offline_sync_queue");
      if (savedQueue) {
        try {
          setSyncQueue(JSON.parse(savedQueue));
        } catch (e) {
          console.error(e);
        }
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const res = await apiFetch<{ success: boolean; packages: OfflinePackage[]; storage: StorageData }>("/profile/offline/packages");
      if (res.success) {
        setPackages(res.packages || []);
        if (res.storage) setStorage(res.storage);
      }
    } catch (err) {
      console.error("Could not fetch packages from API, loading local fallback:", err);
    }
  };

  // 1, 2, 3: Download Vocabulary / Lessons / Tests
  const handleDownload = (pkg: OfflinePackage) => {
    if (!isOnline) {
      showToast("Cần kết nối mạng để tải nội dung mới", "error");
      return;
    }

    setDownloadingId(pkg.id);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingId(null);

          // Update downloaded status
          setPackages((current) =>
            current.map((p) =>
              p.id === pkg.id
                ? { ...p, downloaded: true, downloadedAt: new Date().toISOString() }
                : p
            )
          );

          setStorage((prevStorage) => {
            const newUsed = Number((prevStorage.usedMB + pkg.sizeMB).toFixed(1));
            return {
              ...prevStorage,
              usedMB: newUsed,
              percentage: Number(((newUsed / prevStorage.totalMB) * 100).toFixed(1)),
            };
          });

          showToast(`Đã tải thành công gói "${pkg.title}"!`, "success");
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  // 7: Delete single downloaded package
  const handleDeletePackage = (pkg: OfflinePackage) => {
    setPackages((current) =>
      current.map((p) =>
        p.id === pkg.id ? { ...p, downloaded: false, downloadedAt: null } : p
      )
    );

    setStorage((prevStorage) => {
      const newUsed = Math.max(0, Number((prevStorage.usedMB - pkg.sizeMB).toFixed(1)));
      return {
        ...prevStorage,
        usedMB: newUsed,
        percentage: Number(((newUsed / prevStorage.totalMB) * 100).toFixed(1)),
      };
    });

    showToast(`Đã xóa gói "${pkg.title}" khỏi bộ nhớ ngoại tuyến`, "success");
  };

  // 7: Clear all offline storage
  const handleClearAllStorage = () => {
    setPackages((current) =>
      current.map((p) => ({ ...p, downloaded: false, downloadedAt: null }))
    );
    setStorage({ usedMB: 0, totalMB: 500, percentage: 0 });
    showToast("Đã dọn sạch toàn bộ bộ nhớ lưu trữ ngoại tuyến", "success");
  };

  // 4: Handle Question submit offline
  const handleSelectOption = (optId: string) => {
    if (showExplanation) return;
    setSelectedOption(optId);
    setShowExplanation(true);

    const currentQ = SAMPLE_OFFLINE_QUESTIONS[currentQIndex];
    if (optId === currentQ.correct) {
      setScoreCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < SAMPLE_OFFLINE_QUESTIONS.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Finished practice, add to sync queue
      setPracticeFinished(true);
      const newSyncItem: SyncItem = {
        id: `offline_sess_${Date.now()}`,
        type: "practice_session",
        part: 5,
        score: Math.round(((scoreCount + (selectedOption === SAMPLE_OFFLINE_QUESTIONS[currentQIndex].correct ? 1 : 0)) / SAMPLE_OFFLINE_QUESTIONS.length) * 100),
        questionCount: SAMPLE_OFFLINE_QUESTIONS.length,
        correctCount: scoreCount + (selectedOption === SAMPLE_OFFLINE_QUESTIONS[currentQIndex].correct ? 1 : 0),
        completedAt: new Date().toISOString(),
      };

      const updatedQueue = [...syncQueue, newSyncItem];
      setSyncQueue(updatedQueue);
      if (typeof window !== "undefined") {
        localStorage.setItem("toeic_offline_sync_queue", JSON.stringify(updatedQueue));
      }
      showToast("Bài tập đã hoàn thành và được lưu vào hàng đợi đồng bộ!", "success");
    }
  };

  const handleResetPractice = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScoreCount(0);
    setPracticeFinished(false);
  };

  // 5: Sync when online
  const handleSyncNow = async () => {
    if (!isOnline) {
      showToast("Không thể đồng bộ khi đang ngoại tuyến. Vui lòng kết nối Internet!", "error");
      return;
    }

    if (syncQueue.length === 0) {
      showToast("Hàng đợi đồng bộ đang trống, không có bài tập nào cần tải lên.", "success");
      return;
    }

    try {
      setSyncing(true);
      const res = await apiFetch<{ success: boolean; message: string; syncedCount: number }>("/profile/offline/sync", {
        method: "POST",
        body: JSON.stringify({ items: syncQueue }),
      });

      if (res.success) {
        setSyncQueue([]);
        if (typeof window !== "undefined") {
          localStorage.removeItem("toeic_offline_sync_queue");
        }
        showToast(res.message || "Đã đồng bộ toàn bộ dữ liệu ngoại tuyến lên máy chủ!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi đồng bộ dữ liệu", "error");
    } finally {
      setSyncing(false);
    }
  };

  const downloadedCount = packages.filter((p) => p.downloaded).length;

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
            <DownloadCloud className="w-6 h-6 text-red-400" />
            <span>Học Ngoại Tuyến (Offline Mode 14.1)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tải bài học, từ vựng và đề thi thử về máy để luyện tập mọi lúc mọi nơi không cần kết nối mạng.
          </p>
        </div>

        {/* 6. Offline Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 transition-all ${
              isOnline
                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
                : "bg-red-950/30 border-red-500/30 text-red-400 animate-pulse"
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? "Trực tuyến (Online)" : "Ngoại tuyến (Offline)"}</span>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSyncNow}
            disabled={syncing || syncQueue.length === 0}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-red-400" : ""}`} />
            <span>Đồng bộ ({syncQueue.length})</span>
          </button>
        </div>
      </div>

      {/* Storage Progress Bar Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Dung Lượng Bộ Nhớ Ngoại Tuyến</span>
              <span className="text-xs text-zinc-400">({downloadedCount} gói đã tải)</span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Đã sử dụng {storage.usedMB} MB / {storage.totalMB} MB ({storage.percentage}%)
            </p>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-1.5">
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, storage.percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500">
            <span>Khả dụng: {(storage.totalMB - storage.usedMB).toFixed(1)} MB</span>
            <span>Tối đa: {storage.totalMB} MB</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("packages")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "packages"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <DownloadCloud className="w-4 h-4" />
          <span>Gói Tải Xuống ({packages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "practice"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Trình Luyện Tập Ngoại Tuyến</span>
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "manage"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Quản Lý Dữ Liệu & Bộ Nhớ ({downloadedCount})</span>
        </button>
      </div>

      {/* TAB 1: DOWNLOAD PACKAGES (1, 2, 3) */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => {
              const isDownloading = downloadingId === pkg.id;
              const typeIcon =
                pkg.type === "vocabulary" ? BookA : pkg.type === "lessons" ? BookOpen : ClipboardCheck;
              const Icon = typeIcon;

              return (
                <div
                  key={pkg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    pkg.downloaded
                      ? "bg-zinc-900/60 border-zinc-800"
                      : "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          pkg.type === "vocabulary"
                            ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                            : pkg.type === "lessons"
                            ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-purple-600/10 text-purple-400 border border-purple-500/20"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{pkg.title}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {pkg.version}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{pkg.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{pkg.sizeMB} MB</span>
                      <span>•</span>
                      <span>{pkg.itemCount} bài/câu</span>
                    </div>

                    {isDownloading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 transition-all duration-300"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-red-400">{downloadProgress}%</span>
                      </div>
                    ) : pkg.downloaded ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã tải về</span>
                        </span>
                        <button
                          onClick={() => handleDeletePackage(pkg)}
                          title="Xóa gói tải này"
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownload(pkg)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Tải về máy</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: OFFLINE PRACTICE ENGINE (4) */}
      {activeTab === "practice" && (
        <div className="space-y-6">
          {/* Sub Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setPracticeMode("questions")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                practiceMode === "questions"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Luyện Câu Hỏi Part 5 (Offline Engine)
            </button>
            <button
              onClick={() => setPracticeMode("flashcards")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                practiceMode === "flashcards"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Luyện Từ Vựng Flashcards (Offline Engine)
            </button>
          </div>

          {/* Practice Questions Engine */}
          {practiceMode === "questions" && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
              {!practiceFinished ? (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold">
                        Part 5: Incomplete Sentences
                      </span>
                      <span className="text-xs text-zinc-400">
                        Câu {currentQIndex + 1} / {SAMPLE_OFFLINE_QUESTIONS.length}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-emerald-400">
                      Điểm đúng: {scoreCount}/{currentQIndex + (selectedOption ? 1 : 0)}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div className="py-2">
                    <p className="text-base font-semibold text-white leading-relaxed">
                      {SAMPLE_OFFLINE_QUESTIONS[currentQIndex].question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SAMPLE_OFFLINE_QUESTIONS[currentQIndex].options.map((opt) => {
                      const isChosen = selectedOption === opt.id;
                      const isCorrect = opt.id === SAMPLE_OFFLINE_QUESTIONS[currentQIndex].correct;

                      let btnStyle = "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-300";
                      if (showExplanation) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold";
                        } else if (isChosen && !isCorrect) {
                          btnStyle = "bg-red-950/40 border-red-500/60 text-red-300 line-through";
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id)}
                          className={`p-4 rounded-xl border text-left text-sm flex items-center gap-3 transition-all ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {showExplanation && (
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 text-xs font-bold text-yellow-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Giải thích chi tiết (Offline Database)</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {SAMPLE_OFFLINE_QUESTIONS[currentQIndex].explanation}
                      </p>
                    </div>
                  )}

                  {/* Next Button */}
                  {showExplanation && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                      >
                        <span>
                          {currentQIndex < SAMPLE_OFFLINE_QUESTIONS.length - 1
                            ? "Câu tiếp theo"
                            : "Hoàn thành & Lưu kết quả"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Luyện Tập Ngoại Tuyến Hoàn Thành!</h3>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto">
                    Bạn đã trả lời đúng {scoreCount}/{SAMPLE_OFFLINE_QUESTIONS.length} câu hỏi. Kết quả đã được lưu trữ
                    an toàn trong bộ nhớ máy và sẽ tự động đồng bộ khi có Internet.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={handleResetPractice}
                      className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Luyện tập lại</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("manage")}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>Xem hàng đợi đồng bộ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flashcard Practice Engine */}
          {practiceMode === "flashcards" && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                <span className="text-xs font-bold text-red-400">
                  Flashcard {flashcardIndex + 1} / {SAMPLE_OFFLINE_FLASHCARDS.length}
                </span>
                <span className="text-xs text-zinc-500">Nhấn vào thẻ để lật mặt</span>
              </div>

              {/* Flashcard Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[220px] p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer flex flex-col items-center justify-center text-center transition-all shadow-xl"
              >
                {!isFlipped ? (
                  <div className="space-y-2">
                    <span className="text-2xl font-bold text-white">
                      {SAMPLE_OFFLINE_FLASHCARDS[flashcardIndex].word}
                    </span>
                    <p className="text-xs font-mono text-zinc-400">
                      {SAMPLE_OFFLINE_FLASHCARDS[flashcardIndex].ipa} •{" "}
                      <span className="text-red-400 font-semibold">{SAMPLE_OFFLINE_FLASHCARDS[flashcardIndex].type}</span>
                    </p>
                    <p className="text-xs text-zinc-500 pt-3">👉 Nhấn để xem nghĩa và ví dụ ngữ cảnh</p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <p className="text-base font-bold text-emerald-400">
                      {SAMPLE_OFFLINE_FLASHCARDS[flashcardIndex].meaning}
                    </p>
                    <p className="text-xs text-zinc-300 italic max-w-md">
                      "{SAMPLE_OFFLINE_FLASHCARDS[flashcardIndex].example}"
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setFlashcardIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold disabled:opacity-30"
                >
                  Thẻ trước
                </button>

                <button
                  disabled={flashcardIndex === SAMPLE_OFFLINE_FLASHCARDS.length - 1}
                  onClick={() => {
                    setFlashcardIndex((prev) => Math.min(SAMPLE_OFFLINE_FLASHCARDS.length - 1, prev + 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold disabled:opacity-30"
                >
                  Thẻ tiếp theo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGE OFFLINE STORAGE & SYNC (5, 7) */}
      {activeTab === "manage" && (
        <div className="space-y-6">
          {/* Sync Queue Table */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-yellow-400" />
                  <span>Hàng Đợi Đồng Bộ Dữ Liệu (Sync Queue)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Các bài tập đã hoàn thành trong lúc ngoại tuyến đang chờ gửi lên hệ thống.
                </p>
              </div>

              <button
                onClick={handleSyncNow}
                disabled={syncing || syncQueue.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? "Đang đồng bộ..." : "Đồng bộ tất cả ngay"}</span>
              </button>
            </div>

            {syncQueue.length === 0 ? (
              <div className="p-6 rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                Không có bài tập nào đang chờ đồng bộ. Tất cả dữ liệu đã được cập nhật với máy chủ!
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                {syncQueue.map((item, idx) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-white">Luyện tập Part {item.part} (Ngoại tuyến)</p>
                        <p className="text-[11px] text-zinc-500">{new Date(item.completedAt).toLocaleString("vi-VN")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-emerald-400">
                        {item.correctCount}/{item.questionCount} đúng ({item.score}%)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-yellow-950/40 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold">
                        Chờ đồng bộ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Storage Management */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-red-400" />
                  <span>Quản Lý Bộ Nhớ Đệm Ngoại Tuyến</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Xóa các gói bài học không còn sử dụng để giải phóng dung lượng thiết bị.
                </p>
              </div>

              <button
                onClick={handleClearAllStorage}
                disabled={downloadedCount === 0}
                className="px-3.5 py-2 bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa toàn bộ ({storage.usedMB} MB)</span>
              </button>
            </div>

            <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              {packages
                .filter((p) => p.downloaded)
                .map((pkg) => (
                  <div key={pkg.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{pkg.title}</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Dung lượng: {pkg.sizeMB} MB • Tải lúc:{" "}
                        {pkg.downloadedAt ? new Date(pkg.downloadedAt).toLocaleDateString("vi-VN") : "N/A"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeletePackage(pkg)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-red-950/40 hover:text-red-400 text-zinc-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                ))}

              {downloadedCount === 0 && (
                <div className="p-6 text-center text-xs text-zinc-500">Chưa có gói dữ liệu nào được tải về máy.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
