"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  BookA,
  BookOpen,
  Headphones,
  FileText,
  Flame,
  ClipboardCheck,
  AlertCircle,
  User as UserIcon,
  LogOut,
  Menu,
  Check,
  Clock,
  X,
  Trophy,
} from "lucide-react";
import { useAutoLogout } from "../../hooks/useAutoLogout";
import { useSessionWarning } from "../../hooks/useSessionWarning";
import { apiFetch } from "../../lib/api";

/* ───────── Navigation Items ───────── */

const NAV_MAIN = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Học tập", icon: GraduationCap, href: "/dashboard/courses" },
  { label: "Từ vựng", icon: BookA, href: "/dashboard/vocabulary" },
  { label: "Ngữ pháp", icon: BookOpen, href: "/dashboard/grammar" },
  { label: "Luyện nghe", icon: Headphones, href: "/dashboard/listening" },
  { label: "Luyện đọc", icon: FileText, href: "/dashboard/reading" },
  { label: "Luyện tập", icon: Flame, href: "/dashboard/practice" },
  { label: "Thi thử", icon: ClipboardCheck, href: "/dashboard/mock-test" },
  { label: "Sổ tay lỗi", icon: AlertCircle, href: "/dashboard/error-log" },
];

const NAV_BOTTOM = [
  { label: "Thành tích", icon: Trophy, href: "/dashboard/achievements" },
  { label: "Hồ sơ cá nhân", icon: UserIcon, href: "/dashboard/profile" },
];

const STAGES = [
  { id: 1, label: "Chặng 1", range: "0–300", desc: "Xây dựng nền tảng", color: "from-red-600 to-red-500" },
  { id: 2, label: "Chặng 2", range: "300–500", desc: "Củng cố nền tảng", color: "from-orange-600 to-orange-500" },
  { id: 3, label: "Chặng 3", range: "500–650", desc: "Thành thạo mức TB", color: "from-yellow-600 to-yellow-500" },
  { id: 4, label: "Chặng 4", range: "650–800", desc: "Nâng cao", color: "from-blue-600 to-blue-500" },
  { id: 5, label: "Chặng 5", range: "800–990", desc: "Hoàn thiện", color: "from-green-600 to-green-500" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    currentScore?: number;
    targetScore?: number;
  } | null>(null);

  // Auto logout after inactivity
  const { showWarning, timeRemaining, handleStayLoggedIn, handleLogoutNow } = useAutoLogout();

  // Session expiration warning
  const { sessionWarning, dismissWarning } = useSessionWarning();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }

    try { 
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);

      apiFetch("/profile/me")
        .then((profileData: any) => {
          setUser((prev) => ({
            ...prev,
            ...profileData,
            currentScore: profileData.currentScore ?? 0,
            targetScore: profileData.targetScore ?? 600,
          }));
        })
        .catch(console.error);
    } catch { 
      router.push("/login"); 
    }
  }, [router]);

  const currentStage = (() => {
    const score = user?.currentScore ?? 0;
    if (score >= 800) return 5;
    if (score >= 650) return 4;
    if (score >= 500) return 3;
    if (score >= 300) return 2;
    return 1;
  })();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const currentPageLabel =
    [...NAV_MAIN, ...NAV_BOTTOM].find((item) => isActive(item.href))?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* ─── Mobile Overlay ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0d0d14] border-r border-zinc-800/60
          transform transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0 flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-red-600/20">
              B
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">BELLA</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">TOEIC Platform</p>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto px-4 pt-5 pb-2">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.15em] font-semibold mb-3 px-3">
            Menu chính
          </p>
          <div className="space-y-0.5">
            {NAV_MAIN.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                    ${active
                      ? "bg-red-600/12 text-red-400 border border-red-600/15"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
                </Link>
              );
            })}
          </div>

          {/* Stage Progress */}
          <div className="mt-6 pt-4 border-t border-zinc-800/40">
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.15em] font-semibold mb-3 px-3">
              Lộ trình – Chặng hiện tại
            </p>
            <div className="space-y-0.5">
              {STAGES.map((stage) => (
                <div
                  key={stage.id}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all
                    ${stage.id === currentStage
                      ? "bg-zinc-800/60 text-white"
                      : stage.id < currentStage
                      ? "text-zinc-500"
                      : "text-zinc-700"
                    }
                  `}
                >
                  <span
                    className={`
                      w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0
                      ${stage.id < currentStage
                        ? "bg-green-600/15 text-green-400"
                        : stage.id === currentStage
                        ? `bg-gradient-to-br ${stage.color} text-white shadow-sm`
                        : "bg-zinc-800/80 text-zinc-600"
                      }
                    `}
                  >
                    {stage.id < currentStage ? <Check className="w-3 h-3" /> : stage.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight">{stage.label}</p>
                    <p className="text-[10px] text-zinc-600 leading-tight">{stage.range}</p>
                  </div>
                  {stage.id === currentStage && (
                    <span className="text-[9px] bg-red-600/15 text-red-400 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                      NOW
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Nav */}
        <div className="px-4 py-2 border-t border-zinc-800/40">
          {NAV_BOTTOM.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                  ${active
                    ? "bg-red-600/12 text-red-400 border border-red-600/15"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/40">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600/80 to-red-500/80 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-white font-medium truncate">{user?.fullName || "User"}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email || ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-800/60"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-zinc-800/40">
          <div className="flex items-center justify-between px-4 lg:px-8 h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden w-9 h-9 bg-zinc-800/80 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-white font-semibold text-sm lg:text-base">{currentPageLabel}</h2>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/50 rounded-xl px-3 py-1.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Điểm</span>
                <span className="text-sm font-bold text-red-400">{user?.currentScore ?? "—"}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/50 rounded-xl px-3 py-1.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Mục tiêu</span>
                <span className="text-sm font-bold text-green-400">{user?.targetScore ?? "—"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Auto Logout Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sắp đăng xuất tự động</h3>
                <p className="text-sm text-zinc-400">Do không hoạt động trong 30 phút</p>
              </div>
            </div>

            <div className="bg-black/30 border border-zinc-800/40 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400 mb-1">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-xs text-zinc-500">phút:giây còn lại</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLogoutNow}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Đăng xuất ngay
              </button>
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Tiếp tục sử dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Expiration Warning */}
      {sessionWarning?.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-orange-600/95 border border-orange-500/30 rounded-xl p-4 shadow-xl shadow-orange-600/20 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-orange-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">Phiên đăng nhập sắp hết hạn</h4>
                <p className="text-xs text-orange-100">
                  Phiên đăng nhập của bạn sẽ hết hạn sau {sessionWarning.minutesLeft} phút. Hãy lưu công việc của bạn.
                </p>
              </div>
              <button
                onClick={dismissWarning}
                className="text-orange-200 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
