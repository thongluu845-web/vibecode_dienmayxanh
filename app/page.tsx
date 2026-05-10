import type { Metadata } from "next";
import LocalShippingTwoTone from "@mui/icons-material/LocalShippingTwoTone";
import SecurityTwoTone      from "@mui/icons-material/SecurityTwoTone";
import AutorenewTwoTone     from "@mui/icons-material/AutorenewTwoTone";
import CreditCardTwoTone    from "@mui/icons-material/CreditCardTwoTone";
import StorefrontTwoTone    from "@mui/icons-material/StorefrontTwoTone";
import PeopleTwoTone        from "@mui/icons-material/PeopleTwoTone";
import StarTwoTone          from "@mui/icons-material/StarTwoTone";
import VerifiedTwoTone      from "@mui/icons-material/VerifiedTwoTone";
import { banners, categories, getFeaturedProducts, getFlashSaleProducts, products } from "@/lib/data";
import HeroBanner       from "@/components/home/HeroBanner";
import CategoryGrid     from "@/components/home/CategoryGrid";
import FlashSale        from "@/components/home/FlashSale";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ScrollReveal     from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Điện Máy Xanh – Mua sắm điện máy chính hãng, giá tốt nhất",
  description: "Mua điện thoại, laptop, tivi, tủ lạnh, máy giặt, điều hòa chính hãng tại Điện Máy Xanh. Giá rẻ nhất, giao hàng nhanh, lắp đặt tận nơi toàn quốc.",
};

const jsonLd = {
  "@context": "https://schema.org", "@type": "WebSite",
  name: "Điện Máy Xanh", url: "https://dienmayxanh.com",
  potentialAction: { "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://dienmayxanh.com/tim-kiem?q={search_term_string}" },
    "query-input": "required name=search_term_string" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const benefits: { Icon: any; title: string; desc: string; color: string }[] = [
  { Icon: LocalShippingTwoTone, title: "Giao hàng 2 giờ",  desc: "Nội thành toàn quốc",  color: "bg-blue-100   text-blue-600"   },
  { Icon: SecurityTwoTone,      title: "100% chính hãng",  desc: "Cam kết chính hãng",   color: "bg-green-100  text-green-600"  },
  { Icon: AutorenewTwoTone,     title: "Đổi trả 15 ngày",  desc: "Miễn phí đổi trả",     color: "bg-orange-100 text-orange-600" },
  { Icon: CreditCardTwoTone,    title: "Trả góp 0%",        desc: "Duyệt nhanh 5 phút",  color: "bg-purple-100 text-purple-600" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stats: { Icon: any; value: string; label: string }[] = [
  { Icon: StorefrontTwoTone, value: "2.000+",    label: "Cửa hàng toàn quốc" },
  { Icon: PeopleTwoTone,     value: "10 triệu",  label: "Khách hàng tin dùng" },
  { Icon: StarTwoTone,       value: "4.9 ★",     label: "Điểm đánh giá"       },
  { Icon: VerifiedTwoTone,   value: "100%",      label: "Hàng chính hãng"     },
];

const brands = ["Apple", "Samsung", "Xiaomi", "LG", "Sony", "Panasonic", "HP", "Dell"];

export default function HomePage() {
  const featuredProducts  = getFeaturedProducts();
  const flashSaleProducts = getFlashSaleProducts();
  const phoneProducts     = products.filter((p) => p.categorySlug === "dien-thoai");
  const laptopProducts    = products.filter((p) => p.categorySlug === "laptop");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-8 sm:space-y-12">

        {/* Hero + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3"><HeroBanner banners={banners} /></div>
          <aside className="hidden lg:flex flex-col gap-1.5">
            {categories.slice(0, 8).map((cat, i) => (
              <a key={cat.id} href={`/danh-muc/${cat.slug}`}
                className="flex items-center gap-3 bg-white hover:bg-blue-50 px-3 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group hover:-translate-x-0.5"
                style={{ animationDelay: `${i * 50}ms` }}>
                <span className="text-xl w-7 text-center flex-shrink-0 group-hover:scale-125 transition-transform duration-200">{cat.icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 flex-1 min-w-0 truncate">{cat.name}</span>
                <span className="text-xs text-gray-300 flex-shrink-0">{cat.productCount}</span>
              </a>
            ))}
          </aside>
        </div>

        {/* Benefits */}
        <ScrollReveal variant="up">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {benefits.map(({ Icon, title, desc, color }, i) => (
              <div key={title}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color} icon-pop`}>
                  <Icon style={{ fontSize: 24 }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-sm leading-tight truncate">{title}</p>
                  <p className="text-xs text-gray-500 truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Categories */}
        <ScrollReveal variant="up" delay={100}>
          <div className="bg-white rounded-2xl p-5 shadow-sm"><CategoryGrid categories={categories} /></div>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal variant="zoom" delay={100}>
          <div className="bg-gradient-to-r from-[#0055b3] to-[#0077e6] rounded-2xl p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {stats.map(({ Icon, value, label }, i) => (
                <div key={label} className="flex flex-col items-center text-center gap-2 group" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-12 h-12 bg-white/15 group-hover:bg-white/25 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 icon-bounce">
                    <Icon style={{ fontSize: 24 }} className="text-yellow-300" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Rubik', sans-serif" }}>{value}</p>
                  <p className="text-xs text-blue-200 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Flash Sale */}
        <ScrollReveal variant="up" delay={100}><FlashSale products={flashSaleProducts} /></ScrollReveal>

        {/* Featured */}
        <ScrollReveal variant="up">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <FeaturedProducts products={featuredProducts} title="Sản phẩm nổi bật" viewAllLink="/san-pham" icon="⭐" />
          </div>
        </ScrollReveal>

        {/* Phones */}
        {phoneProducts.length > 0 && (
          <ScrollReveal variant="left">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <FeaturedProducts products={phoneProducts} title="Điện thoại bán chạy" viewAllLink="/danh-muc/dien-thoai" icon="📱" />
            </div>
          </ScrollReveal>
        )}

        {/* Laptops */}
        {laptopProducts.length > 0 && (
          <ScrollReveal variant="right">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <FeaturedProducts products={laptopProducts} title="Laptop nổi bật" viewAllLink="/danh-muc/laptop" icon="💻" />
            </div>
          </ScrollReveal>
        )}

        {/* Brands */}
        <ScrollReveal variant="up" delay={100}>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 mb-5" style={{ fontFamily: "'Rubik', sans-serif" }}>
              <span className="w-1 h-7 bg-blue-600 rounded-full inline-block" />Thương hiệu nổi bật
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-4 md:grid-cols-8 sm:overflow-visible sm:pb-0">
              {brands.map((brand, i) => (
                <a key={brand} href={`/san-pham?brand=${brand.toLowerCase()}`}
                  className="flex-shrink-0 sm:flex-shrink bg-gray-50 border-2 border-transparent
                    hover:border-blue-200 hover:bg-blue-50 hover:shadow-md rounded-2xl px-4 py-3 flex items-center justify-center
                    text-sm font-black text-gray-500 hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 active:scale-95
                    min-w-[80px] cursor-pointer shine-hover"
                  style={{ animationDelay: `${i * 50}ms` }}>
                  {brand}
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </div>
    </>
  );
}
