"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Laptop,
  Smartphone,
  Tablet,
  Check,
  X,
  Database,
  Globe,
  Radio,
  ArrowUpRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function SystemAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"users" | "revenue" | "performance" | "errors" | "patterns">("users");
  const [loading, setLoading] = useState(true);

  // States
  const [userMetrics, setUserMetrics] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadAllSystemAnalytics();
  }, []);

  const loadAllSystemAnalytics = async () => {
    try {
      setLoading(true);
      const [uRes, rRes, pRes, eRes, patRes] = await Promise.all([
        apiFetch<{ success: boolean; metrics: any }>("/admin/system-analytics/user-metrics"),
        apiFetch<{ success: boolean; revenue: any }>("/admin/system-analytics/revenue"),
        apiFetch<{ success: boolean; performance: any }>("/admin/system-analytics/performance"),
        apiFetch<{ success: boolean; logs: any[] }>("/admin/system-analytics/error-logs"),
        apiFetch<{ success: boolean; patterns: any }>("/admin/system-analytics/usage-patterns"),
      ]);

      if (uRes.success) setUserMetrics(uRes.metrics);
      if (rRes.success) setRevenue(rRes.revenue);
      if (pRes.success) setPerformance(pRes.performance);
      if (eRes.success) setErrorLogs(eRes.logs || []);
      if (patRes.success) setPatterns(patRes.patterns);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Lỗi tải dữ liệu phân tích hệ thống");
    } finally {
      setLoading(false);
    }
  };

  // 9. Resolve Error Log
  const handleResolveError = async (id: string) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/system-analytics/error-logs/${id}/resolve`, {
        method: "POST",
      });
      if (res.success) {
        showToast(res.message || "Đã đánh dấu xử lý lỗi!");
        setErrorLogs((prev) =>
          prev.map((e) => (e.id === id ? { ...e, resolved: true } : e))
        );
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi xử lý lỗi");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl bg-zinc-900 border-green-500/30 text-green-400">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
            <span className="text-sm font-medium text-white">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-red-400" />
            <span>Phân Tích Hệ Thống Toàn Diện (System Analytics 17.2)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Theo dõi chỉ số DAU/WAU/MAU, Cohort Retention, Doanh thu MRR, Giám sát hiệu suất máy chủ, Nhật ký lỗi và Mẫu khung giờ học.
          </p>
        </div>

        <button
          onClick={loadAllSystemAnalytics}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm Mới Số Liệu</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "users", label: "Người Dùng & Tăng Trưởng", icon: Users },
          { id: "revenue", label: "Doanh Thu & Tài Chính", icon: DollarSign },
          { id: "performance", label: "Hiệu Suất Máy Chủ", icon: Activity },
          { id: "errors", label: `Nhật Ký Lỗi (${errorLogs.filter((e) => !e.resolved).length})`, icon: AlertTriangle },
          { id: "patterns", label: "Mẫu Sử Dụng & Khung Giờ", icon: Clock },
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

      {loading ? (
        <div className="p-16 text-center text-xs text-zinc-500">Đang tổng hợp dữ liệu phân tích hệ thống...</div>
      ) : (
        <>
          {/* TAB 1: USERS & RETENTION (1. DAU, 2. WAU, 3. MAU, 4. Retention, 5. Churn, 6. Conversion) */}
          {activeTab === "users" && userMetrics && (
            <div className="space-y-6">
              {/* DAU, WAU, MAU, Churn, Conversion */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">1. DAU (Hoạt động ngày)</span>
                  <div className="text-2xl font-black text-white mt-1">{userMetrics.dau}</div>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Tỷ lệ gắn bó {userMetrics.stickinessRatio}%</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">2. WAU (Hoạt động tuần)</span>
                  <div className="text-2xl font-black text-blue-400 mt-1">{userMetrics.wau.toLocaleString()}</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">3. MAU (Hoạt động tháng)</span>
                  <div className="text-2xl font-black text-purple-400 mt-1">{userMetrics.mau.toLocaleString()}</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">5. Tỷ lệ rời bỏ (Churn)</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{userMetrics.churnRate}%</div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Trong ngưỡng an toàn</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">6. Tỷ lệ chuyển đổi Pro</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">{userMetrics.conversionRate}%</div>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">+1.2% tháng này</span>
                </div>
              </div>

              {/* 4. Cohort Retention Table */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span>4. Bảng Phân Tích Giữ Chân Người Học (Cohort Retention Rate)</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="p-3">Nhóm Người Học (Cohort)</th>
                        <th className="p-3">Quy Mô</th>
                        <th className="p-3">Ngày 1 (D1)</th>
                        <th className="p-3">Ngày 7 (D7)</th>
                        <th className="p-3">Ngày 14 (D14)</th>
                        <th className="p-3">Ngày 30 (D30)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {userMetrics.cohortRetention.map((c: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="p-3 font-bold text-white font-sans">{c.cohort}</td>
                          <td className="p-3 text-zinc-300 font-sans">{c.users} học viên</td>
                          <td className="p-3 font-bold text-emerald-400">{c.d1}%</td>
                          <td className="p-3 font-bold text-emerald-400">{c.d7}%</td>
                          <td className="p-3 font-bold text-blue-400">{c.d14}%</td>
                          <td className="p-3 font-bold text-purple-400">{c.d30}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVENUE & FINANCIAL METRICS (7. Revenue metrics) */}
          {activeTab === "revenue" && revenue && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500">Doanh thu định kỳ tháng (MRR)</span>
                  <div className="text-2xl font-black text-emerald-400">{revenue.mrr.toLocaleString()} đ</div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +{revenue.monthlyGrowthRate}% so với tháng trước
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500">Quy mô doanh thu năm (ARR)</span>
                  <div className="text-2xl font-black text-white">{revenue.arr.toLocaleString()} đ</div>
                  <span className="text-[10px] text-zinc-500">Dự phóng dựa trên MRR hiện tại</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500">Doanh thu trung bình/khách (ARPU)</span>
                  <div className="text-2xl font-black text-amber-400">{revenue.arpu.toLocaleString()} đ</div>
                  <span className="text-[10px] text-zinc-400">{revenue.payingUsers} học viên trả phí active</span>
                </div>
              </div>

              {/* Package Breakdown */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Cơ Cấu Doanh Thu Theo Các Gói Khóa Học</span>
                </h3>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {revenue.packageBreakdown.map((pkg: any, idx: number) => (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-white text-sm">{pkg.name}</span>
                        <p className="text-zinc-500 text-[11px]">Giá gói: {pkg.price.toLocaleString()} đ • {pkg.activeSubscribers} người đăng ký</p>
                      </div>
                      <span className="text-base font-black text-emerald-400">{pkg.totalRevenue.toLocaleString()} đ</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM PERFORMANCE (8. System performance) */}
          {activeTab === "performance" && performance && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">Thời gian hoạt động (Uptime)</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{performance.uptime}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">Độ trễ phản hồi API</span>
                  <div className="text-2xl font-black text-blue-400 mt-1">{performance.averageLatencyMs} ms</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">Tải CPU máy chủ</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">{performance.cpuUsagePercent}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">Bộ nhớ RAM đã dùng</span>
                  <div className="text-2xl font-black text-purple-400 mt-1">{performance.memoryUsagePercent}%</div>
                </div>
              </div>

              {/* Microservices Status */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  <span>Trạng Thái Cụm Dịch Vụ Hệ Thống (Infrastructure Status)</span>
                </h3>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {performance.servicesStatus.map((srv: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-white">{srv.service}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400 font-mono text-[11px]">Độ trễ: {srv.latency}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-bold text-[10px]">
                          {srv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ERROR LOGS (9. Error logs) */}
          {activeTab === "errors" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>9. Nhật Ký Lỗi Kỹ Thuật (System Error Logs & Exceptions)</span>
                </h3>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {errorLogs.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">Tuyệt vời! Không có lỗi máy chủ nào được ghi nhận.</div>
                  ) : (
                    errorLogs.map((err) => (
                      <div key={err.id} className="p-4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-red-950/50 text-red-400 font-mono font-bold text-[11px]">
                              HTTP {err.statusCode}
                            </span>
                            <span className="font-mono text-zinc-300 font-bold">{err.endpoint}</span>
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 text-[10px]">
                              {err.source}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {err.resolved ? (
                              <span className="px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đã Xử Lý
                              </span>
                            ) : (
                              <button
                                onClick={() => handleResolveError(err.id)}
                                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold"
                              >
                                Đánh dấu đã sửa
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-zinc-400 font-mono text-[11px] bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                          {err.message}
                        </p>

                        <span className="text-[10px] text-zinc-500 block">
                          Số lần xuất hiện: {err.occurrences} • Ghi nhận gần nhất: {new Date(err.lastSeen).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: USAGE PATTERNS (10. Usage patterns) */}
          {activeTab === "patterns" && patterns && (
            <div className="space-y-6">
              {/* Peak Hours Heatmap */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Biểu Đồ Nhiệt Khung Giờ Học Cao Điểm 24H (Peak Hours Heatmap)</span>
                </h3>

                <div className="space-y-3">
                  {patterns.peakHoursHeatmap.map((ph: any, idx: number) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-300">
                        <span className="font-bold">{ph.hour}</span>
                        <span className="font-semibold text-zinc-400">{ph.traffic} ({ph.learnersPercent}%)</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full"
                          style={{ width: `${ph.learnersPercent * 3.5}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices & Skill Distribution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Devices */}
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-blue-400" />
                    <span>Thiết Bị Truy Cập Học Tập</span>
                  </h3>

                  <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                    {patterns.devicesBreakdown.map((d: any, idx: number) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between">
                        <span className="font-bold text-white">{d.device}</span>
                        <span className="font-black text-blue-400">{d.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Distribution */}
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    <span>Phân Bổ Kỹ Năng Luyện Tập</span>
                  </h3>

                  <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                    {patterns.skillDistribution.map((s: any, idx: number) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between">
                        <span className="font-bold text-white">{s.skill}</span>
                        <span className="font-black text-red-400">{s.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
