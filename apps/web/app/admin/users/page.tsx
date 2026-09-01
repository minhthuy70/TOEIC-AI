"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Activity,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Zap,
  Target,
  BookA,
  ClipboardList,
  Flame,
  X,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Role = "USER" | "CONTENT_ADMIN" | "SUPER_ADMIN";

interface ManagedUser {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  isLocked: boolean;
  isPermanentlyLocked: boolean;
  lockedUntil?: string | null;
  unlockRequestSent: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  stage: number;
  targetScore: number;
  currentScore: number;
  streakDays: number;
  totalPoints: number;
  vocabularyCount: number;
  mockTestCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"list" | "analytics" | "activity">("list");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modals state
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Ban Form State
  const [banReason, setBanReason] = useState("");
  const [banPermanent, setBanPermanent] = useState(true);
  const [banDays, setBanDays] = useState(7);
  const [banning, setBanning] = useState(false);

  // User Activity State
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter, stageFilter]);

  useEffect(() => {
    if (activeTab === "analytics") loadAnalytics();
    if (activeTab === "activity") loadAllActivities();
  }, [activeTab]);

  // 1, 2, 3. Load Users with Search & Filters
  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (stageFilter) params.set("stage", stageFilter);

      const res = await apiFetch<{ items: ManagedUser[]; total: number; page: number; limit: number; totalPages: number }>(
        `/admin/users/manage?${params.toString()}`
      );

      setUsers(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Không thể tải danh sách người dùng", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  // 4. View User Detail
  const openDetail = async (user: ManagedUser) => {
    try {
      const res = await apiFetch<{ success: boolean; user: any }>(`/admin/users/manage/${user.id}`);
      if (res.success) {
        setSelectedUser({ ...user, ...res.user });
        setShowDetailModal(true);
      }
    } catch (e) {
      setSelectedUser(user);
      setShowDetailModal(true);
    }
  };

  // 5. Update Status & Role
  const handleUpdateRole = async (userId: number, newRole: Role) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/users/manage/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      if (res.success) {
        showToast(res.message || "Đã cập nhật vai trò người dùng!");
        loadUsers();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi đổi vai trò", "error");
    }
  };

  // 7. Ban User
  const openBan = (user: ManagedUser) => {
    setSelectedUser(user);
    setBanReason("Vi phạm quy tắc tiêu chuẩn cộng đồng hoặc gian lận thi thử");
    setBanPermanent(true);
    setBanDays(7);
    setShowBanModal(true);
  };

  const handleExecuteBan = async () => {
    if (!selectedUser) return;
    try {
      setBanning(true);
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/users/manage/${selectedUser.id}/ban`, {
        method: "POST",
        body: JSON.stringify({
          reason: banReason,
          permanent: banPermanent,
          days: banDays,
        }),
      });
      if (res.success) {
        showToast(res.message || "Đã khóa cấm tài khoản thành công!", "success");
        setShowBanModal(false);
        loadUsers();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi khóa tài khoản", "error");
    } finally {
      setBanning(false);
    }
  };

  // 7. Unban User
  const handleUnban = async (userId: number) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/users/manage/${userId}/unban`, {
        method: "POST",
      });
      if (res.success) {
        showToast(res.message || "Đã mở khóa tài khoản thành công!", "success");
        loadUsers();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi mở khóa", "error");
    }
  };

  // 6. Delete User
  const handleDeleteUser = async (userId: number, name: string) => {
    if (!confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${name}"? Thao tác này không thể hoàn tác!`)) return;

    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/users/manage/${userId}`, {
        method: "DELETE",
      });
      if (res.success) {
        showToast(res.message || "Đã xóa tài khoản người dùng thành công");
        loadUsers();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi xóa người dùng", "error");
    }
  };

  // 8. User Analytics
  const loadAnalytics = async () => {
    try {
      const res = await apiFetch<{ success: boolean; stats: any }>("/admin/users/manage/analytics/overview");
      if (res.success) setAnalytics(res.stats);
    } catch (e) {
      console.error(e);
    }
  };

  // 9. User Activity Log
  const openUserActivityLog = async (user: ManagedUser) => {
    setSelectedUser(user);
    try {
      const res = await apiFetch<{ success: boolean; logs: any[] }>(`/admin/users/manage/${user.id}/activity-log`);
      if (res.success) setUserLogs(res.logs || []);
    } catch (e) {
      setUserLogs([]);
    }
    setShowActivityModal(true);
  };

  const loadAllActivities = async () => {
    try {
      const res = await apiFetch<{ success: boolean; activities: any[] }>("/admin/users/manage/activity-log/all");
      if (res.success) setAllActivities(res.activities || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
            <Users className="w-6 h-6 text-red-400" />
            <span>Quản Lý Người Dùng (User Management 17.1)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Quản trị danh sách người dùng, phân quyền vai trò, quản lý trạng thái khóa/cấm, phân tích người học và nhật ký hoạt động.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm Mới Danh Sách</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "list", label: `Danh Sách Người Dùng (${total})`, icon: Users },
          { id: "analytics", label: "Phân Tích Người Dùng", icon: BarChart3 },
          { id: "activity", label: "Nhật Ký Hoạt Động Toàn Hệ Thống", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                isSelected
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: USERS LIST VIEW & CRUD (1. List view, 2. Search, 3. Filtering, 4. Detail, 5. Status, 6. Delete, 7. Banning) */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo Tên, Email hoặc ID người dùng..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
            </form>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="">Tất cả Vai Trò</option>
                <option value="USER">USER (Học viên)</option>
                <option value="CONTENT_ADMIN">CONTENT_ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="">Tất cả Trạng Thái</option>
                <option value="ACTIVE">Đang Hoạt Động (Active)</option>
                <option value="LOCKED">Tạm Khóa (Locked)</option>
                <option value="BANNED">Đã Cấm (Banned)</option>
              </select>

              <select
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="">Tất cả Chặng</option>
                <option value="1">Chặng 1 (0–300)</option>
                <option value="2">Chặng 2 (300–500)</option>
                <option value="3">Chặng 3 (500–650)</option>
                <option value="4">Chặng 4 (650–800)</option>
                <option value="5">Chặng 5 (800–990)</option>
              </select>
            </div>
          </div>

          {/* Table Render */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Người Dùng</th>
                    <th className="p-3.5">Vai Trò (Role)</th>
                    <th className="p-3.5">Chặng & Mục Tiêu</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5">Ngày Tham Gia</th>
                    <th className="p-3.5 text-right">Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Đang tải danh sách người dùng...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Không tìm thấy người dùng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isBanned = u.isPermanentlyLocked;
                      const isLocked = u.isLocked && !u.isPermanentlyLocked;
                      return (
                        <tr key={u.id} className="hover:bg-zinc-900/60 transition-colors">
                          {/* User Info */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center font-bold text-xs text-red-400 shrink-0">
                                {u.fullName ? u.fullName.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{u.fullName}</span>
                                <span className="text-[11px] text-zinc-500">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="p-3.5">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value as Role)}
                              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] font-bold text-zinc-200 focus:outline-none focus:border-red-500/50"
                            >
                              <option value="USER">USER</option>
                              <option value="CONTENT_ADMIN">CONTENT_ADMIN</option>
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            </select>
                          </td>

                          {/* Stage & Target */}
                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 font-bold text-[10px]">
                                Chặng {u.stage}
                              </span>
                              <span className="text-[11px] text-zinc-400 block font-semibold">
                                Mục tiêu: {u.targetScore} TOEIC
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            {isBanned ? (
                              <span className="px-2.5 py-1 rounded bg-red-950/50 border border-red-500/30 text-red-400 font-extrabold text-[10px] flex items-center gap-1 w-fit">
                                <ShieldAlert className="w-3 h-3" />
                                <span>Đã Cấm (Banned)</span>
                              </span>
                            ) : isLocked ? (
                              <span className="px-2.5 py-1 rounded bg-amber-950/50 border border-amber-500/30 text-amber-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <Lock className="w-3 h-3" />
                                <span>Tạm Khóa</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <UserCheck className="w-3 h-3" />
                                <span>Hoạt Động</span>
                              </span>
                            )}
                          </td>

                          {/* Created Date */}
                          <td className="p-3.5 text-zinc-500 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* 4. Detail */}
                              <button
                                onClick={() => openDetail(u)}
                                title="Xem chi tiết hồ sơ"
                                className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* 9. Activity Log */}
                              <button
                                onClick={() => openUserActivityLog(u)}
                                title="Xem nhật ký hoạt động"
                                className="p-1.5 hover:text-blue-400 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                              >
                                <Activity className="w-4 h-4" />
                              </button>

                              {/* 7. Ban / Unban */}
                              {isBanned || isLocked ? (
                                <button
                                  onClick={() => handleUnban(u.id)}
                                  title="Mở khóa tài khoản"
                                  className="p-1.5 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openBan(u)}
                                  title="Khóa / Cấm tài khoản"
                                  className="p-1.5 hover:text-amber-400 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              )}

                              {/* 6. Delete */}
                              <button
                                onClick={() => handleDeleteUser(u.id, u.fullName)}
                                title="Xóa tài khoản"
                                className="p-1.5 hover:text-red-400 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>
                Hiển thị trang <strong>{page}</strong> / {totalPages} (Tổng số {total} người dùng)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ANALYTICS STUDIO (8. User analytics) */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Tổng tài khoản đăng ký</span>
              <div className="text-2xl font-black text-white mt-1">{analytics.totalUsers}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Đang hoạt động (Active)</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{analytics.activeUsers}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Tài khoản bị khóa/cấm</span>
              <div className="text-2xl font-black text-red-400 mt-1">{analytics.lockedUsers}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Tăng trưởng tuần này</span>
              <div className="text-2xl font-black text-blue-400 mt-1">+{analytics.newThisWeek} ({analytics.growthRate}%)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Distribution */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" />
                <span>Phân Bổ Học Viên Theo Chặng 1–5</span>
              </h3>

              <div className="space-y-3">
                {analytics.stageDistribution.map((sd: any) => (
                  <div key={sd.stage} className="space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-300">
                      <span className="font-bold">{sd.name}</span>
                      <span>{sd.count} học viên ({sd.percentage}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${sd.percentage * 3}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Breakdown */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Cơ Cấu Vai Trò Hệ Thống (Role Breakdown)</span>
              </h3>

              <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                <div className="p-3.5 flex justify-between items-center">
                  <span className="font-bold text-white">Học viên phổ thông (USER)</span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-200 font-bold">{analytics.roleDistribution.user}</span>
                </div>
                <div className="p-3.5 flex justify-between items-center">
                  <span className="font-bold text-white">Quản trị viên nội dung (CONTENT_ADMIN)</span>
                  <span className="px-2.5 py-1 rounded bg-blue-950/40 text-blue-400 font-bold">{analytics.roleDistribution.contentAdmin}</span>
                </div>
                <div className="p-3.5 flex justify-between items-center">
                  <span className="font-bold text-white">Quản trị viên cấp cao (SUPER_ADMIN)</span>
                  <span className="px-2.5 py-1 rounded bg-red-950/40 text-red-400 font-bold">{analytics.roleDistribution.superAdmin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM ACTIVITY LOG (9. Activity log) */}
      {activeTab === "activity" && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            <span>9. Dòng Thời Gian Hoạt Động Người Dùng (System Activity Trail)</span>
          </h3>

          <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
            {allActivities.map((act) => (
              <div key={act.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{act.userName}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] font-semibold font-mono">
                      {act.action}
                    </span>
                  </div>
                  <p className="text-zinc-300">{act.description}</p>
                </div>

                <div className="text-right text-[11px] text-zinc-500 font-mono self-end sm:self-auto">
                  <span>IP: {act.ip}</span>
                  <span className="block">{new Date(act.timestamp).toLocaleTimeString("vi-VN")} - {new Date(act.timestamp).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. USER DETAIL MODAL */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center font-bold text-sm text-red-400">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUser.fullName}</h3>
                  <span className="text-xs text-zinc-400">{selectedUser.email}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500">Chặng hiện tại</span>
                <div className="text-lg font-black text-red-400 mt-0.5">Chặng {selectedUser.stage}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500">Điểm mục tiêu</span>
                <div className="text-lg font-black text-amber-400 mt-0.5">{selectedUser.targetScore}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500">Chuỗi Streak</span>
                <div className="text-lg font-black text-emerald-400 mt-0.5">{selectedUser.streakDays} Ngày</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500">Tổng XP</span>
                <div className="text-lg font-black text-blue-400 mt-0.5">{selectedUser.totalPoints}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Từ vựng đã học:</span>
                <span className="font-bold text-white">{selectedUser.vocabularyCount} từ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Bài thi đã hoàn thành:</span>
                <span className="font-bold text-white">{selectedUser.mockTestCount} bài thi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Vai trò phân quyền:</span>
                <span className="font-bold text-red-400">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ngày tạo tài khoản:</span>
                <span className="font-bold text-white">{new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BAN USER MODAL */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Khóa / Cấm Tài Khoản Người Dùng</span>
              </h3>
              <button
                onClick={() => setShowBanModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-zinc-300">
                Bạn đang chuẩn bị khóa cấm tài khoản: <strong>{selectedUser.fullName}</strong> ({selectedUser.email}).
              </p>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Lý do khóa / cấm *</label>
                <textarea
                  rows={3}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Nhập lý do vi phạm chi tiết..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-zinc-300 block">Thời hạn khóa</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="banType"
                      checked={banPermanent}
                      onChange={() => setBanPermanent(true)}
                      className="accent-red-600"
                    />
                    <span>Khóa vĩnh viễn (Permanent)</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="banType"
                      checked={!banPermanent}
                      onChange={() => setBanPermanent(false)}
                      className="accent-red-600"
                    />
                    <span>Tạm thời (Số ngày)</span>
                  </label>
                </div>

                {!banPermanent && (
                  <div className="pt-1">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={banDays}
                      onChange={(e) => setBanDays(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                      placeholder="Số ngày tạm khóa"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={banning}
                onClick={handleExecuteBan}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{banning ? "Đang khóa..." : "Xác Nhận Khóa"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. USER ACTIVITY MODAL */}
      {showActivityModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>Nhật Ký: {selectedUser.fullName}</span>
              </h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs max-h-64 overflow-y-auto">
              {userLogs.length === 0 ? (
                <div className="p-4 text-center text-zinc-500">Chưa có nhật ký hoạt động gần đây.</div>
              ) : (
                userLogs.map((log) => (
                  <div key={log.id} className="p-3 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-[10px] text-zinc-500">{log.date}</span>
                    </div>
                    <p className="text-zinc-400">{log.detail}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}