import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CircleCheck,
  Refrigerator,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  ShowerHead,
  Snowflake,
  Star,
  Store,
  Truck,
  Users,
  WashingMachine,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { getBanners, getCategories, getProducts } from "@/lib/catalog";
import { applianceBrands } from "@/lib/brand-assets";
import ApplianceBrandLogo from "@/components/brand/ApplianceBrandLogo";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FlashSale from "@/components/home/FlashSale";
import HeroBanner from "@/components/home/HeroBanner";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CategoryIcon from "@/components/ui/CategoryIcon";

export const metadata: Metadata = {
  title: "Điện Máy Lưu Thảo - Điện lạnh Long Xuyên",
  description:
    "Điện Máy Lưu Thảo mua bán, lắp đặt, bảo trì, sửa chữa và vệ sinh máy lạnh, tủ lạnh, máy giặt, máy nước nóng tại Long Xuyên.",
  alternates: {
    canonical: "https://dienmayluuthao.vn",
  },
  openGraph: {
    title: "Điện Máy Lưu Thảo - Điện lạnh Long Xuyên",
    description:
      "Mua bán, lắp đặt, bảo trì, sửa chữa và vệ sinh máy lạnh, tủ lạnh, máy giặt, máy nước nóng tại Long Xuyên.",
    url: "https://dienmayluuthao.vn",
    siteName: "Điện Máy Lưu Thảo",
    locale: "vi_VN",
    type: "website",
    images: [{ url: "/assets/dien-lanh/hero-dien-lanh.png", width: 1200, height: 630, alt: "Điện Máy Lưu Thảo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Điện Máy Lưu Thảo - Điện lạnh Long Xuyên",
    description: "Hotline 070.6767.921. Có thu máy cũ hoặc đổi máy bù tiền.",
    images: ["/assets/dien-lanh/hero-dien-lanh.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Điện Máy Lưu Thảo",
  url: "https://dienmayluuthao.vn",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://dienmayluuthao.vn/tim-kiem?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const benefits: { Icon: LucideIcon; title: string; desc: string; color: string }[] = [
  { Icon: Truck, title: "Lắp đặt nhanh", desc: "Tận nơi Long Xuyên", color: "bg-sky-50 text-sky-700" },
  { Icon: ShieldCheck, title: "Uy tín", desc: "Chuyên nghiệp", color: "bg-emerald-50 text-emerald-600" },
  { Icon: RefreshCw, title: "Bảo trì - vệ sinh", desc: "Máy lạnh, tủ lạnh, máy giặt", color: "bg-cyan-50 text-cyan-700" },
  { Icon: Repeat2, title: "Thu máy cũ", desc: "Đổi máy bù tiền", color: "bg-blue-50 text-blue-700" },
];

const stats: { Icon: LucideIcon; value: string; label: string }[] = [
  { Icon: Store, value: "Long Xuyên", label: "giao lắp tận nơi" },
  { Icon: Users, value: "070.6767.921", label: "hotline tư vấn" },
  { Icon: Star, value: "Zalo", label: "hỗ trợ nhanh" },
  { Icon: BadgeCheck, value: "Thu máy cũ", label: "đổi máy bù tiền" },
];

export default async function HomePage() {
  const [banners, categories, products] = await Promise.all([getBanners(), getCategories(), getProducts()]);
  const featuredProducts = products.filter((p) => p.isFeatured);
  const flashSaleProducts = products.filter((p) => p.isFlashSale);
  const airProducts = products.filter((p) => p.categorySlug === "may-lanh");
  const washerProducts = products.filter((p) => p.categorySlug === "may-giat");
  const fridgeProducts = products.filter((p) => p.categorySlug === "tu-lanh");
  const heaterProducts = products.filter((p) => p.categorySlug === "may-nuoc-nong");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-custom space-y-7 py-5 sm:space-y-9 sm:py-7">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <HeroBanner banners={banners} />

          <aside className="hidden overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,.4)] lg:block">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-base font-black text-gray-950">Chọn đúng điện lạnh</h2>
              <p className="text-xs font-medium text-gray-500">Tư vấn theo phòng, dung tích, nhu cầu</p>
            </div>
            <div className="p-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/danh-muc/${cat.slug}`}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-blue-50"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl transition group-hover:bg-white group-hover:shadow-sm">
                    <CategoryIcon slug={cat.slug} size={21} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-gray-800 group-hover:text-blue-700">{cat.name}</span>
                    <span className="block truncate text-xs text-gray-400">{cat.description}</span>
                  </span>
                  <CircleCheck size={17} className="text-gray-200 group-hover:text-blue-400" />
                </Link>
              ))}
            </div>
          </aside>
        </div>

        <ScrollReveal variant="up">
          <section className="section-panel rounded-2xl p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {benefits.map(({ Icon, title, desc, color }) => (
                <div key={title} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5">
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={24} strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black leading-tight text-gray-900 sm:text-sm">{title}</p>
                    <p className="mt-0.5 text-xs font-medium leading-tight text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal variant="up" delay={100}>
          <section className="section-panel rounded-2xl p-4 sm:p-5">
            <CategoryGrid categories={categories} />
          </section>
        </ScrollReveal>

        <ScrollReveal variant="zoom" delay={100}>
          <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_18px_50px_-32px_rgba(2,132,199,.32)] sm:p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {stats.map(({ Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Icon size={25} strokeWidth={2.4} />
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-none text-slate-900">{value}</p>
                    <p className="mt-1 text-xs font-bold text-sky-700">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal variant="up" delay={100}>
          <FlashSale products={flashSaleProducts} />
        </ScrollReveal>

        <ScrollReveal variant="up">
          <section className="section-panel rounded-2xl p-4 sm:p-5">
            <FeaturedProducts products={featuredProducts} title="Điện lạnh nổi bật" viewAllLink="/san-pham" icon={<Snowflake size={22} />} />
          </section>
        </ScrollReveal>

        {airProducts.length > 0 && (
          <ScrollReveal variant="left">
            <section className="section-panel rounded-2xl p-4 sm:p-5">
              <FeaturedProducts products={airProducts} title="Máy lạnh tiết kiệm điện" viewAllLink="/danh-muc/may-lanh" icon={<Wind size={22} />} />
            </section>
          </ScrollReveal>
        )}

        {washerProducts.length > 0 && (
          <ScrollReveal variant="right">
            <section className="section-panel rounded-2xl p-4 sm:p-5">
              <FeaturedProducts products={washerProducts} title="Máy giặt sạch sâu" viewAllLink="/danh-muc/may-giat" icon={<WashingMachine size={22} />} />
            </section>
          </ScrollReveal>
        )}

        {fridgeProducts.length > 0 && (
          <ScrollReveal variant="left">
            <section className="section-panel rounded-2xl p-4 sm:p-5">
              <FeaturedProducts products={fridgeProducts} title="Tủ lạnh giữ tươi" viewAllLink="/danh-muc/tu-lanh" icon={<Refrigerator size={22} />} />
            </section>
          </ScrollReveal>
        )}

        {heaterProducts.length > 0 && (
          <ScrollReveal variant="right">
            <section className="section-panel rounded-2xl p-4 sm:p-5">
              <FeaturedProducts products={heaterProducts} title="Máy nước nóng an toàn" viewAllLink="/danh-muc/may-nuoc-nong" icon={<ShowerHead size={22} />} />
            </section>
          </ScrollReveal>
        )}

        <ScrollReveal variant="up" delay={100}>
          <section className="section-panel overflow-hidden rounded-2xl p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-gray-950 sm:text-2xl">Thương hiệu điện lạnh</h2>
              <Link
                href="/san-pham"
                className="rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="brand-marquee relative -mx-4 overflow-hidden border-y border-sky-100 bg-gradient-to-r from-sky-50/70 via-white to-blue-50/80 py-3 sm:-mx-5 sm:py-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white via-white/90 to-transparent sm:w-20" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white via-white/90 to-transparent sm:w-20" />
              <div className="brand-marquee-track flex w-max gap-3 px-4 sm:gap-4 sm:px-5">
                {[...applianceBrands, ...applianceBrands].map((brand, index) => {
                  const isDuplicate = index >= applianceBrands.length;

                  return (
                    <Link
                      key={`${brand.slug}-${index}`}
                      href={`/san-pham?brand=${brand.slug}`}
                      aria-hidden={isDuplicate}
                      tabIndex={isDuplicate ? -1 : undefined}
                      className="group/brand flex h-16 w-36 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white px-4 shadow-[0_14px_34px_-24px_rgba(14,116,144,.55)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_18px_38px_-24px_rgba(2,132,199,.65)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:h-[72px] sm:w-44 lg:w-48"
                    >
                        <ApplianceBrandLogo
                          brand={brand.name}
                          imageClassName="max-h-9 max-w-[7.5rem] transition duration-300 group-hover/brand:scale-105 sm:max-h-10 sm:max-w-[9rem]"
                          sizes="(max-width: 640px) 112px, 144px"
                        />
                      </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </>
  );
}
