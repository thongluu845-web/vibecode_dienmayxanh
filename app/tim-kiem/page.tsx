import type { Metadata } from "next";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { products } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";

interface Props { searchParams: { q?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q ?? "";
  return {
    title: q ? `Tìm kiếm "${q}" – Điện Máy Xanh` : "Tìm kiếm sản phẩm",
    description: `Kết quả tìm kiếm cho "${q}" tại Điện Máy Xanh`,
    robots: { index: false, follow: true },
  };
}

export default function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.toLowerCase() ?? "";

  const results = q
    ? products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-5">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-blue-600">Trang chủ</Link></li>
          <li>/</li>
          <li className="text-gray-800 font-medium">Tìm kiếm</li>
        </ol>
      </nav>

      {/* Search bar */}
      <form method="GET" action="/tim-kiem" className="mb-7 max-w-2xl">
        <div className="relative">
          <input type="search" name="q" defaultValue={searchParams.q}
            placeholder="Nhập tên sản phẩm, thương hiệu..."
            className="w-full py-3.5 pl-5 pr-14 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm shadow-sm" />
          <button type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors">
            <FiSearch size={19} />
          </button>
        </div>
      </form>

      {!q ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <FiSearch size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-bold text-lg mb-1">Tìm kiếm sản phẩm</p>
          <p className="text-gray-400 text-sm">Nhập tên sản phẩm, thương hiệu hoặc danh mục</p>
        </div>
      ) : (
        <>
          <h1 className="text-lg font-bold text-gray-800 mb-5">
            {results.length > 0 ? (
              <>Tìm thấy <span className="text-blue-600 font-black">{results.length}</span> kết quả cho &ldquo;{searchParams.q}&rdquo;</>
            ) : (
              <>Không tìm thấy kết quả cho &ldquo;{searchParams.q}&rdquo;</>
            )}
          </h1>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 font-bold mb-5">Không tìm thấy sản phẩm phù hợp</p>
              <Link href="/san-pham" className="inline-block bg-blue-600 text-white px-7 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors">
                Xem tất cả sản phẩm
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
