import type { Metadata } from "next";
import { MdLocalShipping, MdSecurity, MdLoop, MdCreditCard } from "react-icons/md";
import { banners, categories, getFeaturedProducts, getFlashSaleProducts, products } from "@/lib/data";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import FlashSale from "@/components/home/FlashSale";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export const metadata: Metadata = {
  title: "Điện Máy Xanh – Mua sắm điện máy chính hãng, giá tốt nhất",
  description:
    "Mua điện thoại, laptop, tivi, tủ lạnh, máy giặt, điều hòa chính hãng tại Điện Máy Xanh. Giá rẻ nhất, giao hàng nhanh, lắp đặt tận nơi toàn quốc.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Điện Máy Xanh",
  url: "https://dienmayxanh.com",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://dienmayxanh.com/tim-kiem?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
};

const benefits = [
  { icon: MdLocalShipping, title: "Giao hàng 2 giờ",    desc: "Nội thành toàn quốc",    color: "bg-blue-100 text-blue-600"   },
  { icon: MdSecurity,      title: "100% chính hãng",     desc: "Cam kết chính hãng",      color: "bg-green-100 text-green-600" },
  { icon: MdLoop,          title: "Đổi trả 15 ngày",     desc: "Miễn phí đổi trả",        color: "bg-orange-100 text-orange-600"},
  { icon: MdCreditCard,    title: "Trả góp 0%",           desc: "Duyệt nhanh 5 phút",      color: "bg-purple-100 text-purple-600"},
];

export default function HomePage() {
  const featuredProducts  = getFeaturedProducts();
  const flashSaleProducts = getFlashSaleProducts();
  const phoneProducts     = products.filter((p) => p.categorySlug === "dien-thoai");
  const laptopProducts    = products.filter((p) => p.categorySlug === "laptop");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-7 sm:space-y-10">

        {/* Hero + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <HeroBanner banners={banners} />
          </div>

          {/* Category sidebar - desktop */}
          <aside className="hidden lg:flex flex-col gap-1.5">
            {categories.slice(0, 8).map((cat) => (
              <a
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="flex items-center gap-3 bg-white hover:bg-blue-50 hover:text-blue-600 px-3 py-2.5 rounded-xl shadow-sm hover:shadow transition-all group"
              >
                <span className="text-xl w-7 text-center flex-shrink-0">{cat.icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 flex-1 min-w-0 truncate">{cat.name}</span>
                <span className="text-xs text-gray-300 flex-shrink-0">{cat.productCount}</span>
              </a>
            ))}
          </aside>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {benefits.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={24} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm leading-tight truncate">{title}</p>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <CategoryGrid categories={categories} />

        {/* Flash Sale */}
        <FlashSale products={flashSaleProducts} />

        {/* Featured */}
        <FeaturedProducts
          products={featuredProducts}
          title="Sản phẩm nổi bật"
          viewAllLink="/san-pham"
          icon="⭐"
        />

        {/* Phones */}
        {phoneProducts.length > 0 && (
          <FeaturedProducts
            products={phoneProducts}
            title="Điện thoại bán chạy"
            viewAllLink="/danh-muc/dien-thoai"
            icon="📱"
          />
        )}

        {/* Laptops */}
        {laptopProducts.length > 0 && (
          <FeaturedProducts
            products={laptopProducts}
            title="Laptop nổi bật"
            viewAllLink="/danh-muc/laptop"
            icon="💻"
          />
        )}

        {/* Brand strip */}
        <section>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 mb-4">
            <span className="w-1 h-7 bg-blue-600 rounded-full inline-block" />
            Thương hiệu nổi bật
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-4 md:grid-cols-8 sm:overflow-visible sm:pb-0">
            {["Apple", "Samsung", "Xiaomi", "LG", "Sony", "Panasonic", "HP", "Dell"].map((brand) => (
              <a
                key={brand}
                href={`/san-pham?brand=${brand.toLowerCase()}`}
                className="flex-shrink-0 sm:flex-shrink bg-white border-2 border-transparent hover:border-blue-200 hover:shadow-md rounded-2xl px-4 py-3 flex items-center justify-center text-sm font-black text-gray-500 hover:text-blue-600 shadow-sm transition-all min-w-[80px]"
              >
                {brand}
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
