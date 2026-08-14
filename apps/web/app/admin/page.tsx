"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats } from "@/services/admin";

type User = {
  fullName: string;
  email: string;
  role: string;
};

type AdminStats = {
  users: number;
  vocabulary: number;
  grammarLessons: number;
  tests: number;
};

export default function AdminPage() {
  const [user, setUser] =
    useState<User | null>(null);
  const [stats, setStats] =
    useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch admin statistics
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-zinc-500 mt-2">
          Chào mừng trở lại,{" "}
          <span className="text-white">
            {user?.fullName}
          </span>
        </p>
      </div>

      {/* ROLE */}
      <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-sm text-zinc-500">
          Quyền hiện tại
        </p>

        <div className="mt-2">
          <span
            className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold ${
              user?.role === "SUPER_ADMIN"
                ? "bg-red-600/20 text-red-400"
                : "bg-blue-600/20 text-blue-400"
            }`}
          >
            {user?.role}
          </span>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon="👥"
          title="Người dùng"
          value={loading ? "--" : stats?.users.toString() || "0"}
        />

        <StatCard
          icon="📚"
          title="Từ vựng"
          value={loading ? "--" : stats?.vocabulary.toString() || "0"}
        />

        <StatCard
          icon="📖"
          title="Bài ngữ pháp"
          value={loading ? "--" : stats?.grammarLessons.toString() || "0"}
        />

        <StatCard
          icon="📝"
          title="Đề thi"
          value={loading ? "--" : stats?.tests.toString() || "0"}
        />
      </div>

      {/* MODULES */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">
          Quản lý nội dung
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Link href="/content-admin/vocabulary">
            <ModuleCard
              icon="📚"
              title="Từ vựng"
              description="Quản lý kho từ vựng TOEIC"
            />
          </Link>

          <Link href="/content-admin/grammar/categories">
            <ModuleCard
              icon="📖"
              title="Ngữ pháp"
              description="Quản lý danh mục và bài học"
            />
          </Link>

          <Link href="/content-admin/listening">
            <ModuleCard
              icon="🎧"
              title="Listening"
              description="Quản lý bài nghe và câu hỏi"
            />
          </Link>

          <Link href="/content-admin/reading">
            <ModuleCard
              icon="📕"
              title="Reading"
              description="Quản lý bài đọc và câu hỏi"
            />
          </Link>

          <Link href="/admin/tests">
            <ModuleCard
              icon="📝"
              title="Đề thi"
              description="Quản lý đề và bộ câu hỏi"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="text-2xl">
        {icon}
      </div>

      <p className="text-zinc-500 text-sm mt-4">
        {title}
      </p>

      <p className="text-3xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}

function ModuleCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition">
      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="font-bold text-lg mt-4">
        {title}
      </h3>

      <p className="text-sm text-zinc-500 mt-1">
        {description}
      </p>
    </div>
  );
}