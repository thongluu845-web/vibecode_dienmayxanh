import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { getBrandAsset, getBrandSlug } from "@/lib/brand-assets";
import ApplianceBrandLogo from "@/components/brand/ApplianceBrandLogo";

interface SearchParams { brand?: string; category?: string; sort?: string; filter?: string; }

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const sp = await searchParams;
  const brandTitle = sp.brand ? ` ${getBrandAsset(sp.brand)?.name ?? sp.brand}` : "";
  const title = `Tất cả sản phẩm điện lạnh${brandTitle} - Giá tốt nhất`;
  const description =
    "Khám phá máy lạnh, máy giặt, tủ lạnh, máy nước nóng chính hãng tại Điện Máy Lưu Thảo, giao lắp nhanh tại Long Xuyên.";

  return {
    title,
    description,
    alternates: { canonical: "https://dienmayluuthao.vn/san-pham" },
    openGraph: {
      title,
      description,
      url: "https://dienmayluuthao.vn/san-pham",
      siteName: "Điện Máy Lưu Thảo",
      locale: "vi_VN",
      type: "website",
      images: [{ url: "/assets/dien-lanh/hero-dien-lanh.png", width: 1200, height: 630, alt: "Sản phẩm điện lạnh" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/dien-lanh/hero-dien-lanh.png"],
    },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const brands = Array.from(new Set(products.map((product) => product.brand))).sort((a, b) => a.localeCompare(b));
  const activeBrand = sp.brand ? getBrandSlug(sp.brand) : undefined;

  const sortOptions = [
    { label: "Phổ biến", value: "popular" },
    { label: "Giá thấp - cao", value: "price-asc" },
    { label: "Giá cao - thấp", value: "price-desc" },
    { label: "Mới nhất", value: "newest" },
    { label: "Đánh giá cao", value: "rating" },
  ];

  let filtered = [...products];
  if (sp.brand)    filtered = filtered.filter((p) => getBrandSlug(p.brand) === activeBrand);
  if (sp.category) filtered = filtered.filter((p) => p.categorySlug === sp.category);
  if (sp.filter === "flash-sale") filtered = filtered.filter((p) => p.isFlashSale);
  if (sp.sort === "price-asc")  filtered.sort((a, b) => a.price - b.price);
  if (sp.sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sp.sort === "rating")     filtered.sort((a, b) => b.rating - a.rating);
  if (sp.sort === "newest")     filtered.sort((a, b) => Number(b.isNew) - Number(a.isNew));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-4">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-blue-600">Trang chủ</Link></li>
          <li>/</li>
          <li className="text-gray-800 font-medium">Điện lạnh</li>
        </ol>
      </nav>
      <h1 className="text-2xl font-black text-gray-900 mb-6">
        Tất cả sản phẩm điện lạnh <span className="text-base font-normal text-gray-400 ml-2">({filtered.length})</span>
      </h1>

      <section className="mb-5 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900">Chọn nhanh theo thương hiệu</h2>
            <p className="text-xs font-semibold text-slate-400">Logo chính hãng, bấm để lọc sản phẩm phù hợp.</p>
          </div>
          <Link href="/san-pham" className="text-xs font-black text-sky-700 transition hover:text-sky-900">
            Xóa lọc
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto border-t border-sky-50 bg-sky-50/60 px-4 py-3 no-scrollbar">
          {brands.map((brand) => {
            const slug = getBrandSlug(brand);
            const isActive = activeBrand === slug;

            return (
              <Link
                key={brand}
                href={`/san-pham?brand=${encodeURIComponent(slug)}`}
                aria-label={`Lọc sản phẩm ${brand}`}
                className={`flex h-12 min-w-28 shrink-0 items-center justify-center rounded-xl border px-3 transition hover:-translate-y-0.5 ${
                  isActive
                    ? "border-sky-300 bg-white shadow-md shadow-sky-100"
                    : "border-white bg-white/80 hover:border-sky-200 hover:bg-white"
                }`}
              >
                <ApplianceBrandLogo brand={brand} imageClassName="max-h-6 max-w-[5.8rem]" sizes="96px" />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="flex gap-5">
        <aside className="hidden lg:block w-56 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
            <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 text-sm">
              <SlidersHorizontal size={16} className="text-blue-600" /> Bộ lọc
            </h3>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Danh mục</p>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <a key={cat.id} href={`?category=${cat.slug}`}
                    className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-lg transition-colors ${sp.category === cat.slug ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                    <span className="flex items-center gap-1.5"><CategoryIcon slug={cat.slug} size={15} />{cat.name}</span>
                    <span className="text-xs text-gray-300">{cat.productCount}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thương hiệu</p>
              <div className="space-y-1.5">
                {brands.map((brand) => (
                  <Link
                    key={brand}
                    href={`/san-pham?brand=${encodeURIComponent(getBrandSlug(brand))}`}
                    aria-label={`Lọc thương hiệu ${brand}`}
                    className={`flex h-9 items-center rounded-lg px-2 py-1.5 transition-colors ${
                      activeBrand === getBrandSlug(brand)
                        ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    <ApplianceBrandLogo brand={brand} imageClassName="max-h-4 max-w-[5.5rem]" sizes="88px" />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khoảng giá</p>
              <div className="space-y-1.5">
                {[{ label: "Dưới 5 triệu", value: "0-5m" }, { label: "5-10 triệu", value: "5m-10m" }, { label: "10-20 triệu", value: "10m-20m" }, { label: "Trên 20 triệu", value: "20m+" }].map((r) => (
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
              <SlidersHorizontal size={14} /> Lọc
              <ChevronDown size={13} />
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
              <Search size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-500 font-medium mb-4">Không tìm thấy sản phẩm phù hợp</p>
              <Link href="/san-pham" className="text-blue-600 hover:underline text-sm font-semibold">Xem tất cả sản phẩm</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((p, index) => <ProductCard key={p.id} product={p} priority={index < 4} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
