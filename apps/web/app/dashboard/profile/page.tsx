"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "info", label: "Thông tin cá nhân", icon: "👤" },
  { id: "goal", label: "Mục tiêu TOEIC", icon: "🎯" },
  { id: "password", label: "Đổi mật khẩu", icon: "🔒" },
  { id: "settings", label: "Cài đặt", icon: "⚙️" },
];

const TARGET_OPTIONS = [400, 500, 600, 700, 750, 800, 850, 900, 950, 990];
const STUDY_TIME_OPTIONS = [15, 20, 30, 45, 60, 90, 120];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState<{
    id?: number;
    fullName?: string;
    email?: string;
    currentScore?: number;
    targetScore?: number;
    dailyStudyTime?: number;
  } | null>(null);

  const [fullName, setFullName] = useState("");
  const [targetScore, setTargetScore] = useState(600);
  const [dailyStudyTime, setDailyStudyTime] = useState(30);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    try {
      const u = JSON.parse(stored);
      setUser(u);
      setFullName(u.fullName || "");
      setTargetScore(u.targetScore || 600);
      setDailyStudyTime(u.dailyStudyTime || 30);
    } catch { router.push("/login"); }
  }, [router]);

  const showSaved = (msg = "Đã lưu thành công!") => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const saveInfo = async () => {
    const updated = { ...user, fullName };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    showSaved("Đã cập nhật thông tin!");
  };

  const saveGoal = async () => {
    const updated = { ...user, targetScore, dailyStudyTime };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    showSaved("Đã cập nhật mục tiêu!");
  };

  const savePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setSaveMsg("Vui lòng điền đầy đủ thông tin.");
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setSaveMsg("Mật khẩu mới không khớp!");
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }
    if (newPassword.length < 6) {
      setSaveMsg("Mật khẩu phải có ít nhất 6 ký tự.");
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    showSaved("Đã đổi mật khẩu thành công!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const currentStage = (() => {
    const score = user?.currentScore ?? 0;
    if (score >= 800) return { id: 5, label: "Chặng 5 – Hoàn thiện" };
    if (score >= 650) return { id: 4, label: "Chặng 4 – Nâng cao" };
    if (score >= 500) return { id: 3, label: "Chặng 3 – Trung bình khá" };
    if (score >= 300) return { id: 2, label: "Chặng 2 – Củng cố" };
    return { id: 1, label: "Chặng 1 – Nền tảng" };
  })();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">👤 Hồ sơ cá nhân</h1>
        <p className="text-zinc-400 text-sm mt-1">Quản lý thông tin và cài đặt tài khoản</p>
      </div>

      {/* Profile Card */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-red-600/20 shrink-0">
          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{user?.fullName || "User"}</h2>
          <p className="text-[13px] text-zinc-400 truncate">{user?.email || ""}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[11px] bg-red-600/15 text-red-400 border border-red-600/20 px-2.5 py-0.5 rounded-full font-medium">
              {currentStage.label}
            </span>
            <span className="text-[11px] text-zinc-500">
              Điểm: <span className="text-white font-semibold">{user?.currentScore ?? "—"}</span>
            </span>
            <span className="text-[11px] text-zinc-500">
              Mục tiêu: <span className="text-green-400 font-semibold">{user?.targetScore ?? "—"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {saveMsg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-medium transition-all ${
          saveMsg.includes("không khớp") || saveMsg.includes("Vui lòng") || saveMsg.includes("ít nhất")
            ? "bg-red-600/15 border-red-600/25 text-red-300"
            : "bg-green-600/15 border-green-600/25 text-green-300"
        }`}>
          {saveMsg.includes("không khớp") || saveMsg.includes("Vui lòng") || saveMsg.includes("ít nhất")
            ? "❌"
            : "✅"
          } {saveMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Personal Info ── */}
      {activeTab === "info" && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Thông tin cá nhân</h3>
          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên"
              className="w-full bg-zinc-800/60 border border-zinc-700/60 focus:border-red-600/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-[13px] outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full bg-zinc-800/30 border border-zinc-800/50 text-zinc-500 rounded-xl px-4 py-3 text-[13px] outline-none cursor-not-allowed"
            />
            <p className="text-[10px] text-zinc-600 mt-1.5">Email không thể thay đổi</p>
          </div>
          <button
            onClick={saveInfo}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[13px] transition-all shadow-lg shadow-red-600/15"
          >
            Lưu thay đổi
          </button>
        </div>
      )}

      {/* ── Goal ── */}
      {activeTab === "goal" && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">Mục tiêu TOEIC</h3>

          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-3">
              Mục tiêu điểm TOEIC
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TARGET_OPTIONS.map((score) => (
                <button
                  key={score}
                  onClick={() => setTargetScore(score)}
                  className={`py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                    targetScore === score
                      ? "bg-red-600 border-red-500 text-white shadow-sm shadow-red-600/20"
                      : "bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-3">
              Thời gian học mỗi ngày
            </label>
            <div className="flex gap-2 flex-wrap">
              {STUDY_TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setDailyStudyTime(t)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                    dailyStudyTime === t
                      ? "bg-red-600 border-red-500 text-white shadow-sm"
                      : "bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {t} phút
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-black/30 border border-zinc-800/40 rounded-xl p-4">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mb-2">Xem trước</p>
            <p className="text-[13px] text-zinc-300">
              Bạn sẽ học{" "}
              <span className="text-red-400 font-bold">{dailyStudyTime} phút/ngày</span> để đạt{" "}
              <span className="text-green-400 font-bold">{targetScore} điểm TOEIC</span>
            </p>
          </div>

          <button
            onClick={saveGoal}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[13px] transition-all shadow-lg shadow-red-600/15"
          >
            Lưu mục tiêu
          </button>
        </div>
      )}

      {/* ── Password ── */}
      {activeTab === "password" && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Đổi mật khẩu</h3>
          {[
            { label: "Mật khẩu hiện tại", value: oldPassword, onChange: setOldPassword },
            { label: "Mật khẩu mới", value: newPassword, onChange: setNewPassword },
            { label: "Xác nhận mật khẩu mới", value: confirmPassword, onChange: setConfirmPassword },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block mb-2">
                {field.label}
              </label>
              <input
                type="password"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-800/60 border border-zinc-700/60 focus:border-red-600/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-[13px] outline-none transition-all"
              />
            </div>
          ))}
          <div className="bg-zinc-900/40 border border-zinc-800/30 rounded-xl p-3">
            <p className="text-[11px] text-zinc-500">
              Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số.
            </p>
          </div>
          <button
            onClick={savePassword}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[13px] transition-all shadow-lg shadow-red-600/15"
          >
            Đổi mật khẩu
          </button>
        </div>
      )}

      {/* ── Settings ── */}
      {activeTab === "settings" && (
        <div className="space-y-3">
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 space-y-1">
            <h3 className="text-sm font-semibold text-white mb-4">Cài đặt tài khoản</h3>
            {[
              { label: "Thông báo học tập", desc: "Nhắc nhở học mỗi ngày", defaultOn: true },
              { label: "Thông báo SRS", desc: "Nhắc ôn tập từ vựng theo lịch", defaultOn: true },
              { label: "Âm thanh phát âm", desc: "Phát âm khi học flashcard", defaultOn: false },
              { label: "Dark mode", desc: "Giao diện tối (mặc định)", defaultOn: true },
            ].map((setting, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-800/30 last:border-0">
                <div>
                  <p className="text-[13px] text-white font-medium">{setting.label}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{setting.desc}</p>
                </div>
                <div className={`w-11 h-6 rounded-full border cursor-pointer transition-all ${
                  setting.defaultOn
                    ? "bg-red-600 border-red-500"
                    : "bg-zinc-800 border-zinc-700"
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm m-0.5 transition-all ${
                    setting.defaultOn ? "translate-x-5" : "translate-x-0"
                  }`} />
                </div>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="bg-red-600/5 border border-red-600/15 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-red-400 mb-4">Vùng nguy hiểm</h3>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-600/25 text-red-400 hover:bg-red-600/10 transition-all text-[13px] font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
