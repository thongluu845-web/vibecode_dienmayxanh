"use client";

import { useEffect } from "react";
import Link from "next/link";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import HomeOutlined    from "@mui/icons-material/HomeOutlined";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-5">⚠️</div>
      <h2 className="text-2xl font-black text-gray-800 mb-3">Có lỗi xảy ra</h2>
      <p className="text-gray-500 text-sm mb-8">Đã xảy ra lỗi khi tải trang. Vui lòng thử lại hoặc quay về trang chủ.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors icon-spin">
          <RefreshOutlined style={{ fontSize: 17 }} /> Thử lại
        </button>
        <Link href="/"
          className="flex items-center gap-2 border-2 border-gray-200 hover:border-blue-300 text-gray-600 font-bold px-6 py-3 rounded-2xl transition-colors">
          <HomeOutlined style={{ fontSize: 17 }} /> Trang chủ
        </Link>
      </div>
    </div>
  );
}
