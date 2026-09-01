"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  BarChart3,
  Flame,
  Activity,
  Users,
  AlertTriangle,
  ShieldCheck,
  BookA,
  BookOpen,
  Headphones,
  FileText,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ContentAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"usage" | "performance" | "gaps" | "quality">("usage");
  const [loading, setLoading] = useState(true);

  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [popular, setPopular] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [engagement, setEngagement] = useState<any>(null);
  const [gaps, setGaps] = useState<any[]>([]);
  const [quality, setQuality] = useState<any>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      const [overRes, popRes, perfRes, engRes, gapRes, qualRes] = await Promise.all([
        apiFetch<{ success: boolean; stats: any }>("/admin/content-analytics/overview"),
        apiFetch<{ success: boolean; popularVocabulary: any[]; popularGrammarLessons: any[]; popularTests: any[] }>("/admin/content-analytics/popular"),
        apiFetch<{ success: boolean; metrics: any[] }>("/admin/content-analytics/performance"),
        apiFetch<{ success: boolean; engagementStats: any }>("/admin/content-analytics/engagement"),
        apiFetch<{ success: boolean; gapsList: any[] }>("/admin/content-analytics/gaps"),
        apiFetch<{ success: boolean; qualityOverview: any }>("/admin/content-analytics/quality"),
      ]);

      if (overRes.success) setOverview(overRes.stats);
      if (popRes.success) setPopular(popRes);
      if (perfRes.success) setPerformance(perfRes.metrics || []);
      if (engRes.success) setEngagement(engRes.engagementStats);
      if (gapRes.success) setGaps(gapRes.gapsList || []);
      if (qualRes.success) setQuality(qualRes.qualityOverview);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Lỗi tải dữ liệu phân tích");
    } finally {
      setLoading(false);
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
            <TrendingUp className="w-6 h-6 text-red-400" />
            <span>Phân Tích Nội Dung & Hành Vi Người Học (Content Analytics 16.4)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Báo cáo chuyên sâu mức độ sử dụng nội dung, bài học phổ biến, hiệu suất hoàn thành, khoảng trống nội dung và chỉ số chất lượng.
          </p>
        </div>

        <button
          onClick={loadAllAnalytics}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm Mới Dữ Liệu</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "usage", label: "Sử Dụng & Nội Dung Phổ Biến", icon: Flame },
          { id: "performance", label: "Hiệu Suất & Sự Tham Gia", icon: Activity },
          { id: "gaps", label: `Khoảng Trống Nội Dung (${gaps.length})`, icon: AlertTriangle },
          { id: "quality", label: "Chỉ Số Chất Lượng", icon: ShieldCheck },
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
          {/* TAB 1: CONTENT USAGE & POPULAR CONTENT (1. Content usage stats, 2. Popular content) */}
          {activeTab === "usage" && (
            <div className="space-y-6">
              {/* 1. Overview Cards */}
              {overview && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <BookA className="w-3.5 h-3.5 text-red-400" />
                      <span>Từ vựng đã học</span>
                    </span>
                    <div className="text-2xl font-black text-white">{overview.totalVocabularyLearned.toLocaleString()}</div>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> +14.2% tuần này
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Bài ngữ pháp hoàn thành</span>
                    </span>
                    <div className="text-2xl font-black text-white">{overview.totalGrammarLessonsCompleted.toLocaleString()}</div>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> +9.8% tuần này
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lượt luyện nghe & đọc</span>
                    </span>
                    <div className="text-2xl font-black text-white">{(overview.totalListeningPracticed + overview.totalReadingPassagesCompleted).toLocaleString()}</div>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> +18.5% tuần này
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                      <span>Lượt thi Mock Test</span>
                    </span>
                    <div className="text-2xl font-black text-white">{overview.totalMockTestsTaken.toLocaleString()}</div>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> +22.0% tuần này
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Popular Content Tables */}
              {popular && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top Vocabulary */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookA className="w-4 h-4 text-red-400" />
                      <span>Top Từ Vựng Tra Cứu Nhiều</span>
                    </h3>

                    <div className="divide-y divide-zinc-800 text-xs">
                      {popular.popularVocabulary.map((item: any, idx: number) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-500">#{idx + 1}</span>
                            <div>
                              <span className="font-bold text-white block">{item.word}</span>
                              <span className="text-[10px] text-zinc-500">{item.topic}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-white">{item.views}</span>
                            <span className="text-[10px] text-emerald-400 block font-semibold">{item.masteryRate}% thuộc</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Grammar Lessons */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span>Top Bài Học Ngữ Pháp</span>
                    </h3>

                    <div className="divide-y divide-zinc-800 text-xs">
                      {popular.popularGrammarLessons.map((item: any, idx: number) => (
                        <div key={item.id} className="py-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white max-w-[200px] truncate">{item.title}</span>
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px]">
                              Chặng {item.stage}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-zinc-500">
                            <span>{item.learners} học viên hoàn thành</span>
                            <span className="text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Tests */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-purple-400" />
                      <span>Top Đề Thi Được Làm Nhiều</span>
                    </h3>

                    <div className="divide-y divide-zinc-800 text-xs">
                      {popular.popularTests.map((item: any, idx: number) => (
                        <div key={item.id} className="py-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white max-w-[180px] truncate">{item.title}</span>
                            <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-400 font-bold text-[10px]">
                              {item.type}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-zinc-500">
                            <span>{item.attempts} lượt thi</span>
                            <span className="text-white font-bold">ĐTB: {item.avgScore}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERFORMANCE & USER ENGAGEMENT (3. Performance, 4. Engagement) */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              {/* 3. Performance Table */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  <span>3. Hiệu Suất Nội Dung (Content Performance & Completion Rates)</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="p-3">Phân Hệ Nội Dung</th>
                        <th className="p-3">Tỷ Lệ Hoàn Thành</th>
                        <th className="p-3">Tỷ Lệ Bỏ Dở</th>
                        <th className="p-3">Thời Gian Học TB</th>
                        <th className="p-3">Đánh Giá (Rating)</th>
                        <th className="p-3">Đánh Giá Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {performance.map((m, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="p-3 font-bold text-white">{m.module}</td>
                          <td className="p-3 font-bold text-emerald-400">{m.completionRate}%</td>
                          <td className="p-3 text-zinc-400">{m.dropOffRate}%</td>
                          <td className="p-3 text-zinc-300 font-semibold">{m.averageTimeMinutes} phút</td>
                          <td className="p-3 text-amber-400 font-bold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{m.userRating} / 5.0</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px]">
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. User Engagement Stats */}
              {engagement && (
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>4. Mức Độ Tham Gia Người Dùng (User Engagement Metrics)</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500">Học viên hoạt động/ngày</span>
                      <div className="text-2xl font-black text-white mt-1">{engagement.dailyActiveLearners}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500">Thời lượng học/phiên</span>
                      <div className="text-2xl font-black text-amber-400 mt-1">{engagement.averageSessionDurationMinutes} phút</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500">Số câu luyện tập/ngày</span>
                      <div className="text-2xl font-black text-emerald-400 mt-1">{engagement.averageQuestionsAnsweredDaily} câu</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500">Giữ chân học viên (Retention)</span>
                      <div className="text-2xl font-black text-purple-400 mt-1">{engagement.weeklyRetentionRate}%</div>
                    </div>
                  </div>

                  {/* Weekly Trend Chart */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <span className="text-xs font-bold text-zinc-300">Biểu đồ luyện tập 7 ngày trong tuần:</span>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs">
                      {engagement.weeklyTrend.map((wt: any) => (
                        <div key={wt.day} className="space-y-1.5">
                          <div className="h-24 bg-zinc-900 rounded-lg flex items-end justify-center p-1">
                            <div
                              className="bg-red-600 rounded w-full"
                              style={{ height: `${(wt.drillsCompleted / 7000) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-zinc-400 block font-semibold">{wt.day}</span>
                          <span className="text-[10px] text-white font-bold block">{wt.drillsCompleted}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTENT GAPS IDENTIFICATION (5. Content gaps identification) */}
          {activeTab === "gaps" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>5. Xác Định Khoảng Trống Nội Dung (AI Content Gaps Finder)</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Hệ thống tự động phân tích và cảnh báo các chủ đề, chặng hoặc dạng bài thi còn thiếu nội dung so với chuẩn TOEIC 900+.
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-amber-950/40 border border-amber-500/20 text-amber-400 font-bold rounded-lg text-xs self-start sm:self-auto">
                    {gaps.length} Vấn đề cần bổ sung
                  </span>
                </div>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {gaps.map((gap) => (
                    <div key={gap.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                              gap.priority === "High"
                                ? "bg-red-950/50 text-red-400 border border-red-500/30"
                                : "bg-amber-950/50 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            Ưu tiên: {gap.priority}
                          </span>
                          <span className="font-bold text-white">{gap.category}</span>
                          <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px]">
                            Chặng {gap.stage}
                          </span>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-zinc-500">Hiện có: </span>
                          <span className="font-bold text-white">{gap.currentCount}</span>
                          <span className="text-zinc-500"> / Đề xuất: </span>
                          <span className="font-bold text-emerald-400">{gap.recommendedCount}</span>
                        </div>
                      </div>

                      <p className="text-zinc-300 font-medium">{gap.issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTENT QUALITY METRICS (6. Content quality metrics) */}
          {activeTab === "quality" && quality && (
            <div className="space-y-6">
              {/* Quality Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">Chỉ số chất lượng chung</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{quality.healthScore}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">Độ phủ lời giải thích</span>
                  <div className="text-2xl font-black text-blue-400 mt-1">{quality.explanationCoverage}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">Chất lượng âm thanh Audio</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">{quality.audioQualityRate}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500">Tỷ lệ báo lỗi từ học viên</span>
                  <div className="text-2xl font-black text-purple-400 mt-1">{quality.userErrorReportRate}%</div>
                </div>
              </div>

              {/* Quality Breakdown */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>6. Báo Cáo Tiêu Chuẩn Chất Lượng (Quality Breakdown)</span>
                </h3>

                <div className="space-y-3">
                  {quality.qualityBreakdown.map((qb: any, idx: number) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-300">
                        <span className="font-semibold">{qb.name}</span>
                        <span className="font-bold text-emerald-400">{qb.score}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${qb.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Feedback Reports */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white">Báo Cáo Phản Hồi Từ Người Học Gần Đây</h3>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {quality.recentFeedbackReports.map((fb: any) => (
                    <div key={fb.id} className="p-3.5 flex items-center justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-bold text-[10px] mr-2">
                          {fb.type}
                        </span>
                        <span className="text-zinc-200 font-medium">{fb.content}</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">{fb.date}</span>
                      </div>

                      <span className="px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 font-bold text-[10px]">
                        {fb.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
