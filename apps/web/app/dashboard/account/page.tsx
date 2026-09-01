"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  ShieldCheck,
  Bell,
  Calendar,
  Key,
  Clock,
  Palette,
  Eye,
  CheckCircle2,
  ArrowRight,
  Target,
  Mail,
  Smartphone,
  LogOut,
  ListTodo,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type AccountTab = "profile" | "settings" | "security" | "notifications" | "schedule";

export default function AccountHubPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    currentScore?: number;
    targetScore?: number;
    createdAt?: string;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    apiFetch<any>("/profile/me")
      .then((res) => {
        if (res) setUser((prev) => ({ ...prev, ...res }));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600/15 via-zinc-900/60 to-zinc-900/40 border border-red-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600/30 flex items-center justify-center text-white shadow-lg">
              <User className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>Trung Tâm Tài Khoản & Cài Đặt</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-600/30">
                  Quản Trị Cá Nhân
                </span>
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Quản lý thông tin cá nhân, thiết lập học tập, bảo mật tài khoản và thời gian biểu
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 px-3.5 py-2 rounded-xl border border-zinc-800/80">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-white">{user.fullName || user.email || "Học viên"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl border border-zinc-800/80 bg-[#121218] p-1.5 max-w-3xl overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition ${
            activeTab === "profile"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Hồ sơ cá nhân</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition ${
            activeTab === "settings"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cài đặt hệ thống</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition ${
            activeTab === "security"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Bảo mật & 2FA</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition ${
            activeTab === "notifications"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Thông báo</span>
        </button>

        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition ${
            activeTab === "schedule"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Lịch học</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 md:col-span-2">
              <h3 className="text-base font-bold text-white mb-4">Thông Tin Tài Khoản</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Họ và tên:</span>
                  <span className="font-semibold text-white">{user?.fullName || "Chưa cập nhật"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Email:</span>
                  <span className="font-semibold text-white">{user?.email || "user@toeic-ai.com"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Điểm hiện tại:</span>
                  <span className="font-semibold text-red-400">{user?.currentScore ?? 450} / 990</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Mục tiêu TOEIC:</span>
                  <span className="font-semibold text-emerald-400">{user?.targetScore ?? 750}+ TOEIC</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-2">Chỉnh Sửa Hồ Sơ</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Thay đổi ảnh đại diện (avatar), cập nhật tên hiển thị, thiết lập lại điểm mục tiêu và thời hạn thi.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/profile"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shadow-md shadow-red-600/20"
                >
                  <span>Mở trang hồ sơ đầy đủ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-600/25 text-blue-400 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Cài Đặt Học Tập & SRS</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Tùy chỉnh số lượng từ mới mỗi ngày (10/20/30 từ), thời lượng phiên học, chu kỳ nhắc nhở ngắt quãng SRS và hiển thị phiên âm IPA.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/settings"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
                >
                  <span>Cấu hình học tập</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-600/25 text-purple-400 flex items-center justify-center mb-3">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Giao Diện, Ngôn Ngữ & Trợ Năng</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Chế độ tối (Dark mode), kích thước phông chữ đọc hiểu, chế độ tương phản cao, chuyển đổi ngôn ngữ Việt / Anh và quyền riêng tư dữ liệu.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/settings"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-md shadow-purple-600/20"
                >
                  <span>Cấu hình giao diện & hệ thống</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Trung Tâm Bảo Mật & Xác Thực 2 Lớp (2FA)</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                Bảo vệ tài khoản với mật khẩu mạnh, mã QR Google Authenticator 2FA, lịch sử đăng nhập thiết bị và tự động đăng xuất phiên không hoạt động.
              </p>
            </div>

            <Link
              href="/dashboard/security"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shrink-0 shadow-md shadow-emerald-600/20"
            >
              <span>Quản lý bảo mật</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/25 text-red-400 flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Hộp Thư Thông Báo Hệ Thống</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Xem lại tất cả thông báo về tiến độ học tập, lời chúc chuỗi streak, huy hiệu mới mở khóa và cập nhật đề thi từ ban quản trị.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/notifications"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shadow-md shadow-red-600/20"
                >
                  <span>Mở danh sách thông báo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Cài Đặt Giờ Nhắc Nhở Hàng Ngày</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Thiết lập khung giờ nhắc học (ví dụ 20:00 mỗi tối) để không bao giờ quên duy trì chuỗi Streak và ôn tập đúng hạn.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/reminders"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition shadow-md shadow-amber-600/20"
                >
                  <span>Cài đặt giờ nhắc</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCHEDULE */}
      {activeTab === "schedule" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-600/25 text-blue-400 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Thời Gian Biểu Học Tập</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Lập lịch học các ngày trong tuần: Thứ 2 học Nghe Part 1-2, Thứ 4 luyện Từ vựng, Thứ 7 thi thử Full Test.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/schedule"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
                >
                  <span>Xem thời khóa biểu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-600/25 text-emerald-400 flex items-center justify-center mb-3">
                  <ListTodo className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Kế Hoạch & Đồng Bộ Lịch</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Quản lý to-do list việc cần làm trong ngày và xuất lịch học đồng bộ trực tiếp với Google Calendar / Apple iCal.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60">
                <Link
                  href="/dashboard/planner"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-600/20"
                >
                  <span>Mở kế hoạch ngày</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
