import Link from "next/link";

export default function Home() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        TOEIC AI
      </h1>

      <div className="mt-5 flex gap-4">
        <Link href="/login">
          Đăng nhập
        </Link>

        <Link href="/register">
          Đăng ký
        </Link>
      </div>
    </div>
  );
}