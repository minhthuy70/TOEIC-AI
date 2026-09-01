"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import {
  UsersRound,
  Plus,
  Compass,
  MessageSquare,
  Trophy,
  Target,
  Flame,
  Activity,
  LogOut,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Lock,
  Globe,
  Clock,
  BookOpen,
  Headphones,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Zap,
} from "lucide-react";

interface GroupChallenge {
  id: string;
  title: string;
  progress: string;
  reward: string;
  daysLeft: number;
}

interface GroupLeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  studyHours: number;
  streak: number;
}

interface GroupActivity {
  id: string;
  userName: string;
  action: string;
  time: string;
  type: string;
}

interface GroupMessage {
  id: string;
  userId: number;
  userName: string;
  content: string;
  time: string;
  isMe: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  targetScore: number;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  ownerId: number;
  ownerName: string;
  avatar: string;
  category: string;
  progress: {
    weeklyTargetQuestions: number;
    weeklyCurrentQuestions: number;
    weeklyTargetHours: number;
    weeklyCurrentHours: number;
    percentage: number;
  };
  challenges: GroupChallenge[];
  leaderboard: GroupLeaderboardUser[];
  activities: GroupActivity[];
  messages: GroupMessage[];
}

export default function StudyGroupsPage() {
  const [activeTab, setActiveTab] = useState<"my-groups" | "explore">("my-groups");
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [exploreGroups, setExploreGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);

  // Group Detail Sub-tabs
  const [detailTab, setDetailTab] = useState<"overview" | "chat" | "challenges" | "leaderboard" | "activities">("overview");

  // Create Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    targetScore: 800,
    maxMembers: 50,
    isPrivate: false,
    avatar: "🔥",
    category: "ETS Mock Test",
  });

  // Chat message input
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (detailTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [detailTab, selectedGroup?.messages]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const [myRes, exploreRes] = await Promise.all([
        apiFetch<{ success: boolean; groups: StudyGroup[] }>("/study-groups/my-groups"),
        apiFetch<{ success: boolean; groups: StudyGroup[] }>("/study-groups/explore"),
      ]);

      if (myRes.success && myRes.groups) {
        setMyGroups(myRes.groups);
        if (!selectedGroup && myRes.groups.length > 0) {
          setSelectedGroup(myRes.groups[0]);
        }
      }
      if (exploreRes.success && exploreRes.groups) {
        setExploreGroups(exploreRes.groups);
      }
    } catch (e) {
      console.error("Error loading groups:", e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Create Study Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      const res = await apiFetch<{ success: boolean; message: string; group: StudyGroup }>("/study-groups/create", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      if (res.success && res.group) {
        showToast("Đã tạo nhóm học tập thành công!");
        setShowCreateModal(false);
        setMyGroups((prev) => [res.group, ...prev]);
        setSelectedGroup(res.group);
        setActiveTab("my-groups");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi tạo nhóm", "error");
    }
  };

  // 2. Join Study Group
  const handleJoinGroup = async (group: StudyGroup) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/study-groups/join", {
        method: "POST",
        body: JSON.stringify({ groupId: group.id }),
      });
      if (res.success) {
        showToast("Đã tham gia nhóm học tập thành công!", "success");
        setMyGroups((prev) => [...prev, group]);
        setSelectedGroup(group);
        setActiveTab("my-groups");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi tham gia nhóm", "error");
    }
  };

  // 8. Leave Group
  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    if (!confirm(`Bạn có chắc chắn muốn rời nhóm "${selectedGroup.name}"?`)) return;

    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/study-groups/leave", {
        method: "POST",
        body: JSON.stringify({ groupId: selectedGroup.id }),
      });
      if (res.success) {
        showToast("Đã rời khỏi nhóm học tập", "success");
        setMyGroups((prev) => prev.filter((g) => g.id !== selectedGroup.id));
        setSelectedGroup(myGroups.find((g) => g.id !== selectedGroup.id) || null);
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi rời nhóm", "error");
    }
  };

  // 3. Group Chat: Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedGroup) return;

    const content = chatInput.trim();
    setChatInput("");

    try {
      const res = await apiFetch<{ success: boolean; message: GroupMessage }>(
        `/study-groups/${selectedGroup.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        }
      );
      if (res.success && res.message) {
        setSelectedGroup((prev) =>
          prev ? { ...prev, messages: [...prev.messages, res.message] } : null
        );
      }
    } catch (e: any) {
      showToast(e.message || "Không thể gửi tin nhắn", "error");
    }
  };

  // 4. Join Group Challenge
  const handleJoinChallenge = async (challengeId: string) => {
    if (!selectedGroup) return;
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(
        `/study-groups/${selectedGroup.id}/challenges/join`,
        {
          method: "POST",
          body: JSON.stringify({ challengeId }),
        }
      );
      if (res.success) {
        showToast(res.message || "Đã tham gia thử thách nhóm!");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi tham gia thử thách", "error");
    }
  };

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
            <UsersRound className="w-6 h-6 text-red-400" />
            <span>Nhóm Học Tập & Thi Đua Đồng Đội</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tham gia nhóm học theo mục tiêu điểm số, thảo luận bài tập theo thời gian thực và cùng hoàn thành thử thách tuần.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Nhóm Học Mới</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("my-groups")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "my-groups"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UsersRound className="w-4 h-4" />
          <span>Nhóm Của Tôi ({myGroups.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("explore")}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "explore"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Khám Phá Nhóm ({exploreGroups.length})</span>
        </button>
      </div>

      {/* TAB 1: MY GROUPS & ACTIVE GROUP STUDIO */}
      {activeTab === "my-groups" && (
        <div className="space-y-6">
          {myGroups.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3">
              <UsersRound className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Bạn Chưa Tham Gia Nhóm Nào</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Hãy tham gia một nhóm học tập hoặc tạo nhóm mới để cùng nhau rèn luyện và giải đề thi TOEIC mỗi ngày!
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("explore")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
                >
                  Khám Phá Nhóm
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg"
                >
                  Tạo Nhóm Mới
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Group Selector List (4 Cols) */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block px-1">
                  Danh Sách Nhóm Của Bạn
                </span>

                <div className="space-y-2">
                  {myGroups.map((g) => {
                    const isSelected = selectedGroup?.id === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGroup(g)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-red-950/30 border-red-500/50 shadow-lg shadow-red-950/20"
                            : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                          {g.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">{g.name}</h4>
                            <span className="text-[10px] font-bold text-red-400 shrink-0 ml-1">
                              {g.targetScore}+
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{g.category}</p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-500">
                            <span>{g.memberCount}/{g.maxMembers} thành viên</span>
                            <span>•</span>
                            <span>Tiến độ: {g.progress.percentage}%</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Group Detail Studio (8 Cols) */}
              {selectedGroup && (
                <div className="lg:col-span-8 space-y-5">
                  {/* Group Banner Header */}
                  <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shadow-lg">
                          {selectedGroup.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-white">{selectedGroup.name}</h2>
                            <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 text-[10px] font-bold">
                              Mục tiêu {selectedGroup.targetScore}+
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{selectedGroup.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleLeaveGroup}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-red-950/50 hover:text-red-400 border border-zinc-700 hover:border-red-500/30 text-zinc-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Rời nhóm</span>
                      </button>
                    </div>

                    {/* 6. Group Progress Tracking */}
                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                          <span>Tiến Độ Mục Tiêu Nhóm Tuần Này</span>
                        </span>
                        <span className="font-extrabold text-red-400">{selectedGroup.progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all"
                          style={{ width: `${selectedGroup.progress.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
                        <span>
                          Đã giải: <strong>{selectedGroup.progress.weeklyCurrentQuestions}</strong> /{" "}
                          {selectedGroup.progress.weeklyTargetQuestions} câu
                        </span>
                        <span>
                          Thời gian: <strong>{selectedGroup.progress.weeklyCurrentHours}</strong> /{" "}
                          {selectedGroup.progress.weeklyTargetHours} giờ
                        </span>
                      </div>
                    </div>

                    {/* Sub-tabs within Group */}
                    <div className="flex border-b border-zinc-800 pt-2 text-xs">
                      {[
                        { id: "overview", label: "Tổng quan & Thử thách", icon: Target },
                        { id: "chat", label: `Phòng Chat (${selectedGroup.messages.length})`, icon: MessageSquare },
                        { id: "leaderboard", label: "Bảng Xếp Hạng", icon: Trophy },
                        { id: "activities", label: "Hoạt Động Gần Đây", icon: Activity },
                      ].map((st) => {
                        const Icon = st.icon;
                        return (
                          <button
                            key={st.id}
                            onClick={() => setDetailTab(st.id as any)}
                            className={`px-3.5 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                              detailTab === st.id
                                ? "border-red-500 text-red-400"
                                : "border-transparent text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{st.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* SUBTAB CONTENT */}
                    {/* 1. Overview & Challenges */}
                    {detailTab === "overview" && (
                      <div className="space-y-4 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-yellow-400" />
                          <span>4. Thử Thách Nhóm Đang Diễn Ra (Group Challenges)</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedGroup.challenges.map((c) => (
                            <div
                              key={c.id}
                              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3 flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-white">{c.title}</span>
                                  <span className="px-2 py-0.5 rounded bg-yellow-950/40 border border-yellow-500/20 text-yellow-400 font-bold text-[10px]">
                                    {c.reward}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[11px] text-zinc-400 mt-2">
                                  <span>Tiến độ: {c.progress}</span>
                                  <span>Còn {c.daysLeft} ngày</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleJoinChallenge(c.id)}
                                className="w-full py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-xs font-bold transition-all"
                              >
                                Tham Gia Thử Thách
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Group Chat (3. Group Chat) */}
                    {detailTab === "chat" && (
                      <div className="space-y-3 pt-2">
                        <div className="h-64 overflow-y-auto p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
                          {selectedGroup.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`flex flex-col ${m.isMe ? "items-end" : "items-start"}`}
                            >
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-1">
                                <span className="font-bold text-zinc-400">{m.userName}</span>
                                <span>{m.time}</span>
                              </div>
                              <div
                                className={`px-3 py-2 rounded-2xl max-w-xs ${
                                  m.isMe
                                    ? "bg-red-600 text-white rounded-br-none"
                                    : "bg-zinc-800 text-zinc-200 rounded-bl-none"
                                }`}
                              >
                                {m.content}
                              </div>
                            </div>
                          ))}
                          <div ref={chatBottomRef} />
                        </div>

                        {/* Send Input */}
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Nhập tin nhắn thảo luận cùng nhóm..."
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Gửi</span>
                          </button>
                        </form>
                      </div>
                    )}

                    {/* 3. Group Leaderboard (5. Group Leaderboard) */}
                    {detailTab === "leaderboard" && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>5. Bảng Vinh Danh Thành Viên Nhóm Tuần Này</span>
                        </h4>

                        <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                          {selectedGroup.leaderboard.map((user) => (
                            <div key={user.rank} className="p-3.5 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                    user.rank === 1
                                      ? "bg-amber-500 text-zinc-950"
                                      : user.rank === 2
                                      ? "bg-zinc-300 text-zinc-950"
                                      : user.rank === 3
                                      ? "bg-amber-700 text-white"
                                      : "bg-zinc-800 text-zinc-400"
                                  }`}
                                >
                                  {user.rank}
                                </div>
                                <div>
                                  <span className="font-bold text-white">{user.name}</span>
                                  <p className="text-[10px] text-zinc-500">{user.studyHours}h học • Chuỗi {user.streak}d 🔥</p>
                                </div>
                              </div>

                              <span className="font-extrabold text-red-400 text-sm">+{user.xp} XP</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Group Activities (7. Group Activities) */}
                    {detailTab === "activities" && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-blue-400" />
                          <span>7. Dòng Thời Gian Hoạt Động Của Nhóm</span>
                        </h4>

                        <div className="space-y-2">
                          {selectedGroup.activities.map((a) => (
                            <div
                              key={a.id}
                              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{a.userName}</span>
                                <span className="text-zinc-300">{a.action}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 shrink-0">{a.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPLORE GROUPS (2. Join Group) */}
      {activeTab === "explore" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exploreGroups.map((g) => {
            const isJoined = myGroups.some((mg) => mg.id === g.id);
            return (
              <div
                key={g.id}
                className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl shadow-md shrink-0">
                        {g.avatar}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{g.name}</h3>
                        <p className="text-[11px] text-zinc-400">{g.category}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-bold shrink-0">
                      Mục tiêu {g.targetScore}+
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2">{g.description}</p>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                    {g.isPrivate ? <Lock className="w-3.5 h-3.5 text-yellow-400" /> : <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{g.memberCount}/{g.maxMembers} thành viên</span>
                  </div>

                  {isJoined ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã tham gia</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(g)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tham gia nhóm</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-400" />
                <span>Tạo Nhóm Học Tập Mới</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">Tên nhóm học tập</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Ví dụ: Hội Cày ETS 800+ Hà Nội"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">Mô tả mục tiêu nhóm</label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Mục tiêu cùng nhau giải đề, trao đổi bài tập và sửa lỗi..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">Mục tiêu TOEIC</label>
                  <select
                    value={createForm.targetScore}
                    onChange={(e) => setCreateForm({ ...createForm, targetScore: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value={500}>500+ (Cơ bản)</option>
                    <option value={650}>650+ (Trung cấp)</option>
                    <option value={800}>800+ (Nâng cao)</option>
                    <option value={900}>900+ (Chuyên sâu)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">Biểu tượng nhóm</label>
                  <select
                    value={createForm.avatar}
                    onChange={(e) => setCreateForm({ ...createForm, avatar: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="🔥">🔥 Ngọn lửa</option>
                    <option value="🎯">🎯 Mục tiêu</option>
                    <option value="📚">📚 Sách vở</option>
                    <option value="⚡">⚡ Tốc độ</option>
                    <option value="🎧">🎧 Tai nghe</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                >
                  Xác Nhận Tạo Nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
