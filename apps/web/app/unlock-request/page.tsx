import { Suspense } from "react";
import UnlockRequestClient from "./unlock-request-client";

export default function UnlockRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Đang tải...</div>}>
      <UnlockRequestClient />
    </Suspense>
  );
}