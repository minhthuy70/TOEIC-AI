"use client";

import { useEffect, useState } from "react";
import {
  BarChart2,
  TrendingUp,
  Activity,
  Zap,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Radio,
  Eye,
  Clock,
  Layers,
  Database,
  Cpu,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AnalyticsIntegrationsPage() {
  const [activeTab, setActiveTab] = useState<"ga4" | "mixpanel" | "amplitude" | "custom">("ga4");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Analytics Config
  const [config, setConfig] = useState<any>({
    googleAnalytics: {
      isEnabled: true,
      measurementId: "G-TOEICAI900",
      sendPageView: true,
      anonymizeIp: true,
      debugMode: false,
    },
    mixpanel: {
      isEnabled: true,
      projectToken: "mixpanel_token_live_891238a9",
      trackPageview: true,
      recordSessionsPercent: 100,
    },
    amplitude: {
      isEnabled: true,
      apiKey: "amp_live_api_key_99214a11",
      serverZone: "US",
      minIdLength: 1,
    },
    customAnalytics: {
      isEnabled: true,
      sampleRatePercent: 100,
      retentionDays: 90,
      batchSize: 50,
    },
  });

  // Custom Events State
  const [customEvents, setCustomEvents] = useState<any[]>([]);
  const [topEvents, setTopEvents] = useState<any[]>([]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadAnalyticsConfig();
  }, []);

  useEffect(() => {
    if (activeTab === "custom") {
      loadCustomEvents();
    }
  }, [activeTab]);

  const loadAnalyticsConfig = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; config: any }>("/analytics/config");
      if (res.success && res.config) {
        setConfig(res.config);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomEvents = async () => {
    try {
      const res = await apiFetch<{ success: boolean; events: any[]; topEvents: any[] }>("/analytics/custom-events");
      if (res.success) {
        setCustomEvents(res.events || []);
        setTopEvents(res.topEvents || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const res = await apiFetch<{ success: boolean; message: string; config: any }>("/analytics/config", {
        method: "PUT",
        body: JSON.stringify(config),
      });
      if (res.success) {
        showToast(res.message || "Đã lưu cấu hình tích hợp phân tích thành công!", "success");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi lưu cấu hình", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEvent = async (provider: string, eventName: string) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/analytics/test-event", {
        method: "POST",
        body: JSON.stringify({ provider, eventName }),
      });
      if (res.success) {
        showToast(res.message, "success");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi gửi sự kiện test", "error");
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
            <BarChart2 className="w-6 h-6 text-red-400" />
            <span>Tích Hợp Dịch Vụ Phân Tích (Analytics Integrations 18.3)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Quản trị và cấu hình tích hợp Google Analytics (GA4), Mixpanel, Amplitude và Hệ thống Custom Analytics nội bộ.
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Đang lưu cấu hình..." : "Lưu Cấu Hình Tích Hợp"}</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "ga4", label: "1. Google Analytics (GA4)", icon: BarChart2 },
          { id: "mixpanel", label: "2. Mixpanel", icon: Activity },
          { id: "amplitude", label: "3. Amplitude", icon: TrendingUp },
          { id: "custom", label: "4. Custom Analytics Nội Bộ", icon: Database },
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
        <div className="p-16 text-center text-xs text-zinc-500">Đang tải cấu hình phân tích...</div>
      ) : (
        <>
          {/* TAB 1: GOOGLE ANALYTICS (GA4) */}
          {activeTab === "ga4" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                      GA4
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">1. Cấu Hình Google Analytics 4</h3>
                      <span className="text-xs text-zinc-400">Theo dõi Pageviews, sự kiện học tập và phễu nộp bài thi</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        googleAnalytics: { ...config.googleAnalytics, isEnabled: !config.googleAnalytics.isEnabled },
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                      config.googleAnalytics.isEnabled ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">GA4 Measurement ID *</label>
                    <input
                      type="text"
                      value={config.googleAnalytics.measurementId}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          googleAnalytics: { ...config.googleAnalytics, measurementId: e.target.value },
                        })
                      }
                      placeholder="G-XXXXXXXXXX"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2 divide-y divide-zinc-800/60">
                    <label className="flex items-center justify-between text-zinc-300 cursor-pointer pt-2">
                      <div>
                        <span className="font-bold text-white block">Tự động theo dõi lượt xem trang (Send PageView)</span>
                        <span className="text-[11px] text-zinc-500">Tự động kích hoạt `page_view` khi chuyển route Next.js</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.googleAnalytics.sendPageView}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            googleAnalytics: { ...config.googleAnalytics, sendPageView: e.target.checked },
                          })
                        }
                        className="w-4 h-4 accent-red-600"
                      />
                    </label>

                    <label className="flex items-center justify-between text-zinc-300 cursor-pointer pt-2">
                      <div>
                        <span className="font-bold text-white block">Ẩn danh địa chỉ IP (Anonymize IP)</span>
                        <span className="text-[11px] text-zinc-500">Tuân thủ tiêu chuẩn bảo vệ quyền riêng tư người dùng GDPR</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.googleAnalytics.anonymizeIp}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            googleAnalytics: { ...config.googleAnalytics, anonymizeIp: e.target.checked },
                          })
                        }
                        className="w-4 h-4 accent-red-600"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <span className="text-xs text-zinc-500">Kiểm tra kết nối và gửi tín hiệu thử nghiệm</span>
                  <button
                    type="button"
                    onClick={() => handleTestEvent("google_analytics", "test_mock_exam_submit")}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Test Event (GA4)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MIXPANEL */}
          {activeTab === "mixpanel" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                      MP
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">2. Cấu Hình Mixpanel Analytics</h3>
                      <span className="text-xs text-zinc-400">Phân tích hành vi theo định danh cá nhân và phễu chuyển đổi</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        mixpanel: { ...config.mixpanel, isEnabled: !config.mixpanel.isEnabled },
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                      config.mixpanel.isEnabled ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Mixpanel Project Token *</label>
                    <input
                      type="text"
                      value={config.mixpanel.projectToken}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          mixpanel: { ...config.mixpanel, projectToken: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2 divide-y divide-zinc-800/60">
                    <label className="flex items-center justify-between text-zinc-300 cursor-pointer pt-2">
                      <div>
                        <span className="font-bold text-white block">Tự động định danh người dùng (Identify on Login)</span>
                        <span className="text-[11px] text-zinc-500">Đồng bộ User ID và Chặng học hiện tại sang hồ sơ Mixpanel</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.mixpanel.trackPageview}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            mixpanel: { ...config.mixpanel, trackPageview: e.target.checked },
                          })
                        }
                        className="w-4 h-4 accent-red-600"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <span className="text-xs text-zinc-500">Kiểm tra kết nối và bắn event Mixpanel</span>
                  <button
                    type="button"
                    onClick={() => handleTestEvent("mixpanel", "onboarding_funnel_step3")}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-purple-400 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Test Event (Mixpanel)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AMPLITUDE */}
          {activeTab === "amplitude" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                      AMP
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">3. Cấu Hình Amplitude Analytics</h3>
                      <span className="text-xs text-zinc-400">Phân tích Cohort Retention và tính tương tác của học viên</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        amplitude: { ...config.amplitude, isEnabled: !config.amplitude.isEnabled },
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                      config.amplitude.isEnabled ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Amplitude API Key *</label>
                    <input
                      type="text"
                      value={config.amplitude.apiKey}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          amplitude: { ...config.amplitude, apiKey: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-300">Server Data Center Zone</label>
                    <select
                      value={config.amplitude.serverZone}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          amplitude: { ...config.amplitude, serverZone: e.target.value },
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white"
                    >
                      <option value="US">Standard US Data Center (Khuyên dùng)</option>
                      <option value="EU">European Union (EU) Resident</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <span className="text-xs text-zinc-500">Kiểm tra kết nối và bắn event Amplitude</span>
                  <button
                    type="button"
                    onClick={() => handleTestEvent("amplitude", "spaced_repetition_review")}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Test Event (Amplitude)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM INTERNAL ANALYTICS */}
          {activeTab === "custom" && (
            <div className="space-y-6">
              {/* Top Events Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                {topEvents.map((te, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-zinc-500 font-mono text-[11px] block truncate">{te.name}</span>
                    <div className="text-2xl font-black text-white">{te.count.toLocaleString()}</div>
                    <span className="text-[10px] text-red-400 font-bold">{te.percent}% tổng lưu lượng</span>
                  </div>
                ))}
              </div>

              {/* Live Event Stream */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>Luồng Sự Kiện Thu Thập Trực Tiếp (Real-Time Custom Telemetry Feed)</span>
                  </h3>

                  <button
                    onClick={loadCustomEvents}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Làm mới
                  </button>
                </div>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {customEvents.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">Chưa có sự kiện telemetry nào được ghi nhận.</div>
                  ) : (
                    customEvents.map((evt) => (
                      <div key={evt.id} className="p-4 space-y-2 hover:bg-zinc-900/60 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-red-950/50 text-red-400 font-mono font-bold text-[11px]">
                              {evt.eventName}
                            </span>
                            <span className="text-zinc-400 text-xs">User ID: #{evt.userId}</span>
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 text-[10px]">
                              {evt.platform}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-500 font-mono">
                            <span>IP: {evt.ip}</span> • <span>{new Date(evt.timestamp).toLocaleTimeString("vi-VN")} - {new Date(evt.timestamp).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>

                        <pre className="text-zinc-300 font-mono text-[11px] bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 overflow-x-auto">
                          {JSON.stringify(evt.properties, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
