import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">

      <div className="text-center">

        <div className="w-28 h-28 rounded-full bg-red-600 mx-auto flex items-center justify-center text-6xl font-bold text-white shadow-lg">
          B
        </div>

        <h1 className="text-5xl font-bold text-white mt-6">
          BELLA
        </h1>

        <p className="text-gray-400 mt-2">
          AI TOEIC Learning Platform
        </p>

        <div className="flex gap-4 justify-center mt-8">

          <Link
            href="/login"
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Đăng nhập
          </Link>

          <Link
            href="/register"
            className="px-6 py-3 border border-red-600 text-red-500 rounded-xl"
          >
            Đăng ký
          </Link>

        </div>

      </div>

    </main>
  );
}