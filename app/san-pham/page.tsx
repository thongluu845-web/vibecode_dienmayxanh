import type { Metadata } from "next";
import { products, categories } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import TuneOutlined           from "@mui/icons-material/TuneOutlined";
import ExpandMoreOutlined     from "@mui/icons-material/ExpandMoreOutlined";

export const metadata: Metadata = {
  title: "Tất cả sản phẩm điện máy – Giá tốt nhất",
  description: "Khám phá hàng ngàn sản phẩm điện máy chính hãng tại Điện Máy Xanh.",
};

interface SearchParams { brand?: string; category?: string; sort?: string; filter?: string; }

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const sortOptions = [
    { label: "Phổ biến",        value: "popular"   },
    { label: "Giá thấp → cao", value: "price-asc"  },
    { label: "Giá cao → thấp", value: "price-desc" },
    { label: "Mới nhất",        value: "newest"    },
    { label: "Đánh giá cao",   value: "rating"     },
  ];

  let filtered = [...products];
  if (sp.brand)    filtered = filtered.filter((p) => p.brand.toLowerCase() === sp.brand?.toLowerCase());
  if (sp.category) filtered = filtered.filter((p) => p.categorySlug === sp.category);
  if (sp.filter === "flash-sale") filtered = filtered.filter((p) => p.isFlashSale);
  if (sp.sort === "price-asc")  filtered.sort((a, b) => a.price - b.price);
  if (sp.sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sp.sort === "rating")     filtered.sort((a, b) => b.rating - a.rating);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-4">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-blue-600">Trang chủ</Link></li>
          <li>/</li>
          <li className="text-gray-800 font-medium">Tất cả sản phẩm</li>
        </ol>
      </nav>
      <h1 className="text-2xl font-black text-gray-900 mb-6">
        Tất cả sản phẩm <span className="text-base font-normal text-gray-400 ml-2">({filtered.length})</span>
      </h1>

      <div className="flex gap-5">
        <aside className="hidden lg:block w-56 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
            <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 text-sm">
              <TuneOutlined style={{ fontSize: 16 }} className="text-blue-600" /> Bộ lọc
            </h3>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Danh mục</p>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <a key={cat.id} href={`?category=${cat.slug}`}
                    className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-lg transition-colors ${sp.category === cat.slug ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                    <span className="flex items-center gap-1.5"><span>{cat.icon}</span>{cat.name}</span>
                    <span className="text-xs text-gray-300">{cat.productCount}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thương hiệu</p>
              <div className="space-y-1.5">
                {["Apple", "Samsung", "Xiaomi", "LG", "Sony"].map((brand) => (
                  <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer group">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span className="text-gray-600 group-hover:text-blue-600 transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khoảng giá</p>
              <div className="space-y-1.5">
                {[{ label: "Dưới 5 triệu", value: "0-5m" }, { label: "5–10 triệu", value: "5m-10m" }, { label: "10–20 triệu", value: "10m-20m" }, { label: "Trên 20 triệu", value: "20m+" }].map((r) => (
                  <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer group">
                    <input type="radio" name="price" className="text-blue-600" />
                    <span className="text-gray-600 group-hover:text-blue-600 transition-colors">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl shadow-sm px-4 py-3 flex-wrap">
            <span className="text-sm text-gray-500 font-medium flex-shrink-0">Sắp xếp:</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
              {sortOptions.map((opt) => (
                <a key={opt.value} href={`?sort=${opt.value}`}
                  className={`text-xs px-3.5 py-1.5 rounded-xl border whitespace-nowrap transition-colors flex-shrink-0 font-semibold ${(sp.sort === opt.value || (!sp.sort && opt.value === "popular")) ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"}`}>
                  {opt.label}
                </a>
              ))}
            </div>
            <button className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl flex-shrink-0 font-medium">
              <TuneOutlined style={{ fontSize: 14 }} /> Lọc
              <ExpandMoreOutlined style={{ fontSize: 13 }} />
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 font-medium mb-4">Không tìm thấy sản phẩm phù hợp</p>
              <Link href="/san-pham" className="text-blue-600 hover:underline text-sm font-semibold">Xem tất cả sản phẩm</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
