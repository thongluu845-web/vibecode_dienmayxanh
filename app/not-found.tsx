import type { Metadata } from "next";
import Link from "next/link";
import HomeOutlined         from "@mui/icons-material/HomeOutlined";
import SearchOutlined       from "@mui/icons-material/SearchOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";

export const metadata: Metadata = {
  title: "404 – Trang không tìm thấy | Điện Máy Xanh",
  description: "Trang bạn tìm kiếm không tồn tại.",
  robots: { index: false, follow: true },
};

const quickLinks = [
  { label: "Điện thoại", href: "/danh-muc/dien-thoai", emoji: "📱" },
  { label: "Laptop",     href: "/danh-muc/laptop",      emoji: "💻" },
  { label: "Tivi",       href: "/danh-muc/tivi",         emoji: "📺" },
  { label: "Tủ lạnh",   href: "/danh-muc/tu-lanh",      emoji: "🧊" },
];

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-9xl font-black text-blue-100 leading-none mb-4 select-none">404</div>
      <h1 className="text-2xl font-black text-gray-800 mb-2">Trang không tìm thấy</h1>
      <p className="text-gray-500 text-sm mb-8">Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.</p>

      <form method="GET" action="/tim-kiem" className="mb-8 max-w-sm mx-auto">
        <div className="relative">
          <input type="search" name="q" placeholder="Tìm kiếm sản phẩm..."
            className="w-full py-3 pl-4 pr-12 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm" />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center">
            <SearchOutlined style={{ fontSize: 16 }} />
          </button>
        </div>
      </form>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}
            className="flex flex-col items-center gap-2 bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-md rounded-2xl p-3 transition-all">
            <span className="text-3xl">{link.emoji}</span>
            <span className="text-xs font-semibold text-gray-600">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors">
          <HomeOutlined style={{ fontSize: 17 }} /> Về trang chủ
        </Link>
        <Link href="/san-pham" className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-6 py-3 rounded-2xl transition-colors group">
          Xem sản phẩm
          <ChevronRightOutlined style={{ fontSize: 17 }} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
