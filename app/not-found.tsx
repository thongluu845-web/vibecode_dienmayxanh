import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home, Search } from "lucide-react";
import CategoryIcon from "@/components/ui/CategoryIcon";

export const metadata: Metadata = {
  title: "404 - Trang không tìm thấy | Điện Máy Lưu Thảo",
  description: "Trang bạn tìm kiếm không tồn tại.",
  robots: { index: false, follow: true },
};

const quickLinks = [
  { label: "Máy lạnh", href: "/danh-muc/may-lanh", slug: "may-lanh" },
  { label: "Máy giặt", href: "/danh-muc/may-giat", slug: "may-giat" },
  { label: "Tủ lạnh", href: "/danh-muc/tu-lanh", slug: "tu-lanh" },
  { label: "Máy nước nóng", href: "/danh-muc/may-nuoc-nong", slug: "may-nuoc-nong" },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mb-4 select-none text-9xl font-black leading-none text-blue-100">404</div>
      <h1 className="mb-2 text-2xl font-black text-gray-800">Trang không tìm thấy</h1>
      <p className="mb-8 text-sm text-gray-500">Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.</p>

      <form method="GET" action="/tim-kiem" className="mx-auto mb-8 max-w-sm">
        <div className="relative">
          <input
            type="search"
            name="q"
            placeholder="Tìm máy lạnh, máy giặt, tủ lạnh..."
            className="w-full rounded-2xl border-2 border-gray-200 py-3 pl-4 pr-12 text-sm focus:border-blue-400 focus:outline-none"
          />
          <button type="submit" className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-xl bg-blue-600 p-2 text-white">
            <Search size={16} />
          </button>
        </div>
      </form>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-gray-100 bg-white p-3 transition hover:border-blue-200 hover:shadow-md">
            <CategoryIcon slug={link.slug} size={28} className="text-blue-600" />
            <span className="text-xs font-semibold text-gray-600">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700">
          <Home size={17} />
          Về trang chủ
        </Link>
        <Link href="/san-pham" className="group flex items-center gap-2 rounded-2xl border-2 border-blue-600 px-6 py-3 font-bold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white">
          Xem sản phẩm
          <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
