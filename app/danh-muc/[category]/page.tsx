import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategories, getCategoryBySlug, getProductsByCategory } from "@/lib/catalog";
import { getBrandSlug } from "@/lib/brand-assets";
import ApplianceBrandLogo from "@/components/brand/ApplianceBrandLogo";
import ProductCard from "@/components/product/ProductCard";
import CategoryIcon from "@/components/ui/CategoryIcon";

interface Props { params: Promise<{ category: string }> }

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Danh mục không tồn tại" };
  const title = `${cat.name} - Điện Máy Lưu Thảo`;
  const description = `Mua ${cat.name} tại Điện Máy Lưu Thảo. ${cat.description}. Giao lắp nhanh tại Long Xuyên.`;
  const url = `https://dienmayluuthao.vn/danh-muc/${category}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Điện Máy Lưu Thảo",
      locale: "vi_VN",
      type: "website",
      images: [{ url: cat.image ?? "/assets/dien-lanh/hero-dien-lanh.png", width: 1200, height: 630, alt: cat.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cat.image ?? "/assets/dien-lanh/hero-dien-lanh.png"],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const [cat, categories, catProducts] = await Promise.all([
    getCategoryBySlug(category),
    getCategories(),
    getProductsByCategory(category),
  ]);
  if (!cat) notFound();
  const categoryBrands = Array.from(new Set(catProducts.map((product) => product.brand))).sort((a, b) => a.localeCompare(b));
  const jsonLd = { "@context": "https://schema.org", "@type": "CollectionPage", name: cat.name, description: cat.description, url: `https://dienmayluuthao.vn/danh-muc/${category}` };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <nav className="text-xs text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight size={13} />
          <span className="text-gray-800 font-medium">{cat.name}</span>
        </nav>

        <div className="bg-gradient-to-r from-[#0055b3] to-[#0077e6] rounded-2xl p-6 sm:p-8 mb-7 text-white shadow-lg">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
              <CategoryIcon slug={cat.slug} size={38} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-1">{cat.name}</h1>
              <p className="text-blue-200 text-sm mb-2">{cat.description}</p>
              <span className="inline-block bg-white/20 text-white text-xs font-black px-3 py-1 rounded-xl">{cat.productCount} sản phẩm</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => (
            <Link key={c.id} href={`/danh-muc/${c.slug}`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${c.slug === category ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm"}`}>
              <CategoryIcon slug={c.slug} size={16} /><span>{c.name}</span>
            </Link>
          ))}
        </div>

        {categoryBrands.length > 0 && (
          <section className="mb-6 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">Thương hiệu trong danh mục</h2>
                <p className="text-xs font-semibold text-slate-400">Lọc nhanh {cat.name.toLowerCase()} theo logo hãng.</p>
              </div>
              <Link href="/san-pham" className="hidden text-xs font-black text-sky-700 transition hover:text-sky-900 sm:inline">
                Tất cả
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categoryBrands.map((brand) => (
                <Link
                  key={brand}
                  href={`/san-pham?category=${cat.slug}&brand=${getBrandSlug(brand)}`}
                  aria-label={`Xem ${cat.name} thương hiệu ${brand}`}
                  className="flex h-12 min-w-28 shrink-0 items-center justify-center rounded-xl border border-sky-50 bg-sky-50/70 px-3 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-md hover:shadow-sky-100"
                >
                  <ApplianceBrandLogo brand={brand} imageClassName="max-h-6 max-w-[5.8rem]" sizes="96px" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {catProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <CategoryIcon slug={cat.slug} size={56} className="mx-auto mb-4 text-blue-200" />
            <p className="text-gray-600 font-bold text-lg mb-2">Đang cập nhật sản phẩm {cat.name}</p>
            <p className="text-gray-400 text-sm mb-6">Chúng tôi đang bổ sung sản phẩm vào danh mục này</p>
            <Link href="/san-pham" className="inline-block bg-blue-600 text-white px-7 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors">Xem tất cả sản phẩm</Link>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-500 mb-4">Hiển thị <strong className="text-gray-800">{catProducts.length}</strong> sản phẩm</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {catProducts.map((p, index) => <ProductCard key={p.id} product={p} priority={index < 4} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
