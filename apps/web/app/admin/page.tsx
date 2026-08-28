"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats } from "@/services/admin";
import {
  Users,
  BookOpen,
  FileText,
  Headphones,
  BookMarked,
  Edit3,
} from "lucide-react";

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
          icon={Users}
          title="Người dùng"
          value={loading ? "--" : stats?.users.toString() || "0"}
        />

        <StatCard
          icon={BookOpen}
          title="Từ vựng"
          value={loading ? "--" : stats?.vocabulary.toString() || "0"}
        />

        <StatCard
          icon={BookMarked}
          title="Bài ngữ pháp"
          value={loading ? "--" : stats?.grammarLessons.toString() || "0"}
        />

        <StatCard
          icon={FileText}
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
              icon={BookOpen}
              title="Từ vựng"
              description="Quản lý kho từ vựng TOEIC"
            />
          </Link>

          <Link href="/content-admin/grammar/categories">
            <ModuleCard
              icon={BookMarked}
              title="Ngữ pháp"
              description="Quản lý danh mục và bài học"
            />
          </Link>

          <Link href="/content-admin/listening">
            <ModuleCard
              icon={Headphones}
              title="Listening"
              description="Quản lý bài nghe và câu hỏi"
            />
          </Link>

          <Link href="/content-admin/reading">
            <ModuleCard
              icon={FileText}
              title="Reading"
              description="Quản lý bài đọc và câu hỏi"
            />
          </Link>

          <Link href="/admin/tests">
            <ModuleCard
              icon={Edit3}
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
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/20 text-red-400 flex items-center justify-center">
        <Icon className="w-5 h-5" />
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
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition">
      <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-600/20 text-red-400 flex items-center justify-center">
        <Icon className="w-6 h-6" />
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