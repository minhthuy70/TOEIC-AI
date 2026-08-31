"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Flame,
  Trophy,
  Target,
  Sparkles,
  TrendingUp,
  Settings,
  Trash2,
  Check,
  X,
  RefreshCw,
  Filter,
  ChevronDown,
  BellRing,
  Calendar,
  Zap,
} from "lucide-react";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string | null;
  priority: string;
  category: string;
  actionUrl: string | null;
  actionLabel: string | null;
  metadata: string | null;
  isRead: boolean;
  readAt: string | null;
  expiresAt: string | null;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface NotificationPreferences {
  id: number;
  userId: number;
  reviewDueReminders: boolean;
  studyTimeReminders: boolean;
  testReminders: boolean;
  streakWarnings: boolean;
  goalProgressUpdates: boolean;
  achievementUnlocked: boolean;
  newContentAvailable: boolean;
  weeklySummary: boolean;
  monthlySummary: boolean;
  challengeUpdates: boolean;
  leaderboardChanges: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    unreadCount: number;
    hasMore: boolean;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [page, categoryFilter, unreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (page * pageSize).toString(),
        ...(unreadOnly && { unreadOnly: "true" }),
      });

      const res = await apiFetch<NotificationsResponse>(`/notifications?${params}`);
      if (res.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await apiFetch("/notifications/preferences");
      if (res.success) {
        setPreferences(res.data);
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiFetch(`/notifications/read/${notificationId}`, {
        method: "POST",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch("/notifications/read-all", {
        method: "POST",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await apiFetch(`/notifications/${notificationId}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      await apiFetch("/notifications/preferences", {
        method: "POST",
        body: JSON.stringify(newPreferences),
      });
      fetchPreferences();
      setShowSettings(false);
    } catch (err) {
      console.error("Error updating preferences:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "review_due":
        return <BookOpen className="w-4 h-4" />;
      case "study_time":
        return <Clock className="w-4 h-4" />;
      case "streak_warning":
        return <Flame className="w-4 h-4" />;
      case "goal_progress":
        return <Target className="w-4 h-4" />;
      case "achievement_unlocked":
        return <Trophy className="w-4 h-4" />;
      case "challenge_update":
        return <Sparkles className="w-4 h-4" />;
      case "leaderboard_change":
        return <TrendingUp className="w-4 h-4" />;
      case "weekly_summary":
      case "monthly_summary":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-600/10 border-red-500/20 text-red-400";
      case "high":
        return "bg-orange-600/10 border-orange-500/20 text-orange-400";
      case "normal":
        return "bg-blue-600/10 border-blue-500/20 text-blue-400";
      case "low":
        return "bg-zinc-600/10 border-zinc-500/20 text-zinc-400";
      default:
        return "bg-zinc-600/10 border-zinc-500/20 text-zinc-400";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      study: "Học tập",
      achievement: "Thành tích",
      social: "Xã hội",
      system: "Hệ thống",
      challenge: "Thử thách",
    };
    return labels[category] || category;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      review_due: "Ôn tập đến hạn",
      study_time: "Thời gian học",
      test_reminder: "Nhắc nhở kiểm tra",
      streak_warning: "Cảnh báo chuỗi",
      goal_progress: "Tiến độ mục tiêu",
      achievement_unlocked: "Mở khóa thành tích",
      new_content: "Nội dung mới",
      weekly_summary: "Tóm tắt tuần",
      monthly_summary: "Tóm tắt tháng",
      challenge_update: "Cập nhật thử thách",
      leaderboard_change: "Thay đổi xếp hạng",
    };
    return labels[type] || type;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-400" />
            <span>Thông Báo</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Quản lý thông báo và cài đặt nhắc nhở</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Cài đặt"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              unreadOnly
                ? "bg-red-600 text-white"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4" />
              <span>Chưa đọc</span>
            </div>
          </button>
        </div>

        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-red-500/50"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="study">Học tập</option>
            <option value="achievement">Thành tích</option>
            <option value="social">Xã hội</option>
            <option value="system">Hệ thống</option>
            <option value="challenge">Thử thách</option>
          </select>
          <Filter className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Đọc tất cả</span>
            </div>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Đang tải thông báo...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Không có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                notification.isRead
                  ? "bg-zinc-900/40 border-zinc-800/40"
                  : "bg-red-950/20 border-red-900/30"
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getPriorityColor(notification.priority)}`}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-white">{notification.title}</h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-sm text-zinc-400 mb-2">{notification.message}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{getTypeLabel(notification.type)}</span>
                      <span>•</span>
                      <span>{getCategoryLabel(notification.category)}</span>
                      <span>•</span>
                      <span>{getRelativeTime(notification.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Button */}
                {notification.actionUrl && notification.actionLabel && (
                  <button
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                      window.location.href = notification.actionUrl;
                    }}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    {notification.actionLabel}
                  </button>
                )}
              </div>
          ))}

          {/* Load More */}
          {notifications.length >= pageSize && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Xem thêm
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && preferences && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-400" />
                <span>Cài đặt thông báo</span>
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Study Notifications */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Thông báo học tập</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: "reviewDueReminders", label: "Nhắc nhở ôn tập đến hạn" },
                    { key: "studyTimeReminders", label: "Nhắc nhở thời gian học" },
                    { key: "testReminders", label: "Nhắc nhở kiểm tra" },
                    { key: "streakWarnings", label: "Cảnh báo chuỗi ngày" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                      <span className="text-sm text-zinc-300">{item.label}</span>
                      <button
                        onClick={() => updatePreferences({ [item.key]: !preferences[item.key as keyof NotificationPreferences] })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences[item.key as keyof NotificationPreferences]
                            ? "bg-red-600"
                            : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences[item.key as keyof NotificationPreferences]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Notifications */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Thông báo thành tích</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: "achievementUnlocked", label: "Mở khóa thành tích" },
                    { key: "goalProgressUpdates", label: "Cập nhật tiến độ mục tiêu" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                      <span className="text-sm text-zinc-300">{item.label}</span>
                      <button
                        onClick={() => updatePreferences({ [item.key]: !preferences[item.key as keyof NotificationPreferences] })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences[item.key as keyof NotificationPreferences]
                            ? "bg-red-600"
                            : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences[item.key as keyof NotificationPreferences]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Notifications */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Thông báo xã hội</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: "challengeUpdates", label: "Cập nhật thử thách" },
                    { key: "leaderboardChanges", label: "Thay đổi bảng xếp hạng" },
                    { key: "newContentAvailable", label: "Nội dung mới" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                      <span className="text-sm text-zinc-300">{item.label}</span>
                      <button
                        onClick={() => updatePreferences({ [item.key]: !preferences[item.key as keyof NotificationPreferences] })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences[item.key as keyof NotificationPreferences]
                            ? "bg-red-600"
                            : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences[item.key as keyof NotificationPreferences]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Notifications */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span>Tóm tắt</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: "weeklySummary", label: "Tóm tắt hàng tuần" },
                    { key: "monthlySummary", label: "Tóm tắt hàng tháng" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                      <span className="text-sm text-zinc-300">{item.label}</span>
                      <button
                        onClick={() => updatePreferences({ [item.key]: !preferences[item.key as keyof NotificationPreferences] })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences[item.key as keyof NotificationPreferences]
                            ? "bg-red-600"
                            : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences[item.key as keyof NotificationPreferences]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Method */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Phương thức nhận</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                    <span className="text-sm text-zinc-300">Thông báo đẩy</span>
                    <button
                      onClick={() => updatePreferences({ pushEnabled: !preferences.pushEnabled })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.pushEnabled
                          ? "bg-red-600"
                          : "bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          preferences.pushEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                    <span className="text-sm text-zinc-300">Email</span>
                    <button
                      onClick={() => updatePreferences({ emailEnabled: !preferences.emailEnabled })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.emailEnabled
                          ? "bg-red-600"
                          : "bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          preferences.emailEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}