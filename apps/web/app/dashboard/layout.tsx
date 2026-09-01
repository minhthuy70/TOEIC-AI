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
  Calendar,
  ListTodo,
  Sparkles,
  Star,
  TrendingUp,
  Award,
  Target,
  Gift,
  Bell,
  BellRing,
  Settings,
  DownloadCloud,
  Radio,
  LayoutGrid,
  Users,
  Share2,
  UsersRound,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { useAutoLogout } from "../../hooks/useAutoLogout";
import { useSessionWarning } from "../../hooks/useSessionWarning";
import { apiFetch } from "../../lib/api";

/* ───────── Categorized Navigation Items ───────── */

const NAV_GROUPS = [
  {
    category: "Menu Chính",
    items: [
      { label: "Bảng điều khiển", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Trung tâm học tập", icon: BookOpen, href: "/dashboard/learning" },
      { label: "Luyện tập & Thi thử", icon: Target, href: "/dashboard/practice" },
      { label: "Sổ tay câu sai AI", icon: AlertCircle, href: "/dashboard/error-log" },
      { label: "Tiến độ & Thành tích", icon: TrendingUp, href: "/dashboard/progress" },
      { label: "Tài khoản & Cài đặt", icon: UserIcon, href: "/dashboard/account" },
    ],
  },
  {
    category: "Mở rộng & Tiện ích",
    items: [
      { label: "Gợi ý thông minh AI", icon: Sparkles, href: "/dashboard/recommendations" },
      { label: "Khóa học tổng hợp", icon: GraduationCap, href: "/dashboard/courses" },
      { label: "Cộng đồng & Bạn bè", icon: Users, href: "/dashboard/friends" },
      { label: "Nhóm học tập", icon: UsersRound, href: "/dashboard/study-groups" },
      { label: "Chia sẻ mạng xã hội", icon: Share2, href: "/dashboard/social-share" },
      { label: "Học ngoại tuyến", icon: DownloadCloud, href: "/dashboard/offline" },
      { label: "Âm thanh nền", icon: Radio, href: "/dashboard/audio-player" },
      { label: "Tiện ích Widgets", icon: LayoutGrid, href: "/dashboard/widgets" },
    ],
  },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    "Mở rộng & Tiện ích": true,
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    currentScore?: number;
    targetScore?: number;
    streak?: number;
    pointsBalance?: number;
    currentLevel?: number;
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

      Promise.all([
        apiFetch<any>("/profile/me").catch(() => null),
        apiFetch<any>("/levels/info").catch(() => null),
        apiFetch<any>("/notifications?unreadOnly=true").catch(() => null),
      ]).then(([profileData, levelData, notifData]: [any, any, any]) => {
        setUser((prev) => ({
          ...prev,
          ...(profileData || {}),
          currentScore: profileData?.currentScore ?? 0,
          targetScore: profileData?.targetScore ?? 600,
          currentLevel: levelData?.data?.currentLevel || levelData?.data?.currentLevelInfo?.levelNumber || 1,
        }));
        if (notifData && Array.isArray(notifData.notifications)) {
          setUnreadCount(notifData.notifications.length);
        } else if (notifData && typeof notifData.unreadCount === "number") {
          setUnreadCount(notifData.unreadCount);
        }
      }).catch(console.error);
    } catch { 
      router.push("/login"); 
    }
  }, [router]);

  const toggleGroup = (category: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

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

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/learning") {
      return (
        pathname.startsWith("/dashboard/learning") ||
        pathname.startsWith("/dashboard/vocabulary") ||
        pathname.startsWith("/dashboard/grammar") ||
        pathname.startsWith("/dashboard/review")
      );
    }
    if (href === "/dashboard/practice") {
      return (
        pathname.startsWith("/dashboard/practice") ||
        pathname.startsWith("/dashboard/listening") ||
        pathname.startsWith("/dashboard/reading") ||
        pathname.startsWith("/dashboard/mock-test")
      );
    }
    if (href === "/dashboard/progress") {
      return (
        pathname.startsWith("/dashboard/progress") ||
        pathname.startsWith("/dashboard/streak") ||
        pathname.startsWith("/dashboard/points") ||
        pathname.startsWith("/dashboard/badges") ||
        pathname.startsWith("/dashboard/achievements") ||
        pathname.startsWith("/dashboard/leaderboard") ||
        pathname.startsWith("/dashboard/challenges") ||
        pathname.startsWith("/dashboard/rewards")
      );
    }
    if (href === "/dashboard/account") {
      return (
        pathname.startsWith("/dashboard/account") ||
        pathname.startsWith("/dashboard/profile") ||
        pathname.startsWith("/dashboard/settings") ||
        pathname.startsWith("/dashboard/security") ||
        pathname.startsWith("/dashboard/notifications") ||
        pathname.startsWith("/dashboard/reminders") ||
        pathname.startsWith("/dashboard/schedule") ||
        pathname.startsWith("/dashboard/planner") ||
        pathname.startsWith("/dashboard/calendar")
      );
    }
    return pathname.startsWith(href);
  };

  // Flatten items for current page label lookup
  const allNavItems = NAV_GROUPS.flatMap((g) => g.items);
  const currentPageLabel =
    allNavItems.find((item) => isActive(item.href))?.label || "Dashboard";

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
        {/* Logo Header */}
        <div className="px-5 py-4 border-b border-zinc-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-red-600/20">
              B
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">BELLA</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">TOEIC Platform</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="px-4 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm nhanh tính năng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Categorized Nav Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 admin-sidebar-scroll">
          {NAV_GROUPS.map((group) => {
            const filteredItems = group.items.filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (searchQuery && filteredItems.length === 0) return null;

            const isCollapsed = collapsedGroups[group.category] && !searchQuery;

            return (
              <div key={group.category} className="space-y-1">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.category)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors group/hdr"
                >
                  <span>{group.category}</span>
                  {!searchQuery && (
                    <span className="text-zinc-600 group-hover/hdr:text-zinc-400 transition-colors">
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </button>

                {/* Category Items */}
                {!isCollapsed && (
                  <div className="space-y-0.5 pl-1">
                    {filteredItems.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200
                            ${active
                              ? "bg-red-600/15 text-red-400 border border-red-600/20 font-semibold"
                              : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
                            }
                          `}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${active ? "text-red-400" : "text-zinc-400"}`} />
                          <span className="truncate">{item.label}</span>
                          {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Stage Progress Summary Accordion */}
          <div className="pt-2 border-t border-zinc-800/40">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-2 px-2.5">
              Lộ trình hiện tại
            </p>
            <div className="space-y-0.5 pl-1">
              {STAGES.map((stage) => (
                <div
                  key={stage.id}
                  className={`
                    flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[12px] transition-all
                    ${stage.id === currentStage
                      ? "bg-zinc-800/80 text-white border border-zinc-700/50"
                      : stage.id < currentStage
                      ? "text-zinc-500"
                      : "text-zinc-700"
                    }
                  `}
                >
                  <span
                    className={`
                      w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0
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
                    <p className="text-xs font-medium leading-tight truncate">{stage.label}</p>
                  </div>
                  {stage.id === currentStage && (
                    <span className="text-[9px] bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
                      Đang học
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer User Info */}
        <div className="p-3 border-t border-zinc-800/40">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600/80 to-red-500/80 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{user?.fullName || "Học viên"}</p>
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
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Level Badge (Cấp độ) */}
              <Link
                href="/dashboard/levels"
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border border-blue-500/35 hover:border-blue-500/70 rounded-xl px-3 py-1.5 transition-all hover:scale-105 active:scale-95 group shadow-lg shadow-blue-950/30"
                title="Cấp độ học viên"
              >
                <Award className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-blue-300">
                  Lv.{user?.currentLevel ?? 1}
                </span>
              </Link>

              {/* Streak Badge (Chuỗi ngày học liên tục) */}
              <Link
                href="/dashboard/streak"
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-950/70 to-amber-950/70 border border-orange-500/35 hover:border-orange-500/70 rounded-xl px-3 py-1.5 transition-all hover:scale-105 active:scale-95 group shadow-lg shadow-orange-950/30"
                title="Chuỗi ngày học (Streak)"
              >
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-orange-400">
                  {user?.streak ?? 0} <span className="hidden sm:inline font-semibold text-[11px] text-orange-300/80">ngày</span>
                </span>
              </Link>

              {/* Notification Bell Button */}
              <Link
                href="/dashboard/notifications"
                className="relative flex items-center justify-center w-9 h-9 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95 group"
                title="Thông báo"
              >
                <Bell className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
                {unreadCount > 0 ? (
                  <>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                  </>
                ) : (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-400/80 rounded-full" />
                )}
              </Link>

              {/* TOEIC Score Target Pill */}
              <div className="hidden md:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Điểm:</span>
                <span className="font-bold text-red-400">{user?.currentScore ?? "—"}</span>
                <span className="text-zinc-600">/</span>
                <span className="font-bold text-green-400">{user?.targetScore ?? "—"}</span>
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

