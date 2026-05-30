import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, ChevronRight, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { getProductBySlug, getProducts, getProductsByCategory } from "@/lib/catalog";
import { getBrandSlug } from "@/lib/brand-assets";
import ApplianceBrandLogo from "@/components/brand/ApplianceBrandLogo";
import StarRating from "@/components/ui/StarRating";
import ProductCard from "@/components/product/ProductCard";
import ProductActions from "@/components/product/ProductActions";

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Sản phẩm không tồn tại" };
  const title = `${product.name} - Giá ${formatPrice(product.price)}`;
  const description = `${product.shortDescription}. Mua ${product.name} tại Điện Máy Lưu Thảo, giao lắp nhanh, bảo hành tận nơi.`;
  const url = `https://dienmayluuthao.vn/san-pham/${product.slug}`;

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
      images: [{ url: product.thumbnail, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.thumbnail],
    },
  };
}

const policies: { Icon: LucideIcon; text: string; color: string }[] = [
  { Icon: ShieldCheck, text: "Hàng chính hãng 100%", color: "text-green-500" },
  { Icon: Truck, text: "Giao lắp 2-4 giờ", color: "text-blue-500" },
  { Icon: RefreshCw, text: "Đổi trả 15 ngày", color: "text-cyan-500" },
  { Icon: BadgeCheck, text: "Bảo hành 24 tháng", color: "text-purple-500" },
];

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProductsByCategory(product.categorySlug)).filter((p) => p.id !== product.id).slice(0, 5);
  const productUrl = `https://dienmayluuthao.vn/san-pham/${product.slug}`;
  const productImages = product.images.map((image) => image.startsWith("http") ? image : `https://dienmayluuthao.vn${image}`);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product",
    name: product.name, description: product.description, image: productImages, url: productUrl,
    brand: { "@type": "Brand", name: product.brand },
    offers: { "@type": "Offer", price: product.price, priceCurrency: "VND",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Điện Máy Lưu Thảo" } },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <nav className="text-xs text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight size={13} />
          <Link href={`/danh-muc/${product.categorySlug}`} className="hover:text-blue-600">{product.category}</Link>
          <ChevronRight size={13} />
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 shadow-inner">
                <Image src={product.images[0]} alt={product.name} fill priority sizes="(max-width:1024px) 100vw,50vw" className="object-contain p-5" />
                {product.discount > 0 && (
                  <span className="absolute top-3 left-3 bg-sky-600 text-white font-bold text-sm px-3 py-1 rounded-xl shadow">-{product.discount}%</span>
                )}
              </div>
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-200 cursor-pointer flex-shrink-0">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="64px" className="object-contain p-1" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Link href={`/san-pham?brand=${getBrandSlug(product.brand)}`}
                  aria-label={`Xem sản phẩm thương hiệu ${product.brand}`}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 transition hover:border-sky-200 hover:bg-white">
                  <ApplianceBrandLogo brand={product.brand} imageClassName="max-h-5 max-w-[7rem]" sizes="112px" />
                  <BadgeCheck size={15} className="shrink-0 text-blue-400" />
                </Link>
                {product.isNew && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-lg">MỚI</span>}
                {product.stock < 10 && product.stock > 0 && <span className="bg-cyan-100 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded-lg">SẮP HẾT</span>}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} size={16} />
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">Đã bán <strong className="text-gray-700">{product.sold.toLocaleString("vi-VN")}</strong></span>
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-2xl p-4 mb-5">
                <p className="text-3xl sm:text-4xl font-black text-sky-700 mb-1">{formatPrice(product.price)}</p>
                {product.originalPrice > product.price && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                    <span className="bg-sky-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">Tiết kiệm {formatPrice(product.originalPrice - product.price)}</span>
                  </div>
                )}
                <p className="mt-2 text-sm font-semibold text-emerald-700">
                  Có thu máy cũ hoặc đổi máy bù tiền
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Điểm nổi bật</p>
                <p className="text-sm text-gray-700 font-medium">{product.shortDescription}</p>
              </div>

              <ProductActions product={product} />

              <div className="grid grid-cols-2 gap-2">
                {policies.map(({ Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    <Icon size={18} className={`${color} flex-shrink-0`} />
                    <span className="text-xs font-medium text-gray-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">Thông số kỹ thuật</h2>
            <div className="divide-y divide-gray-50">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex py-3 gap-4">
                  <span className="text-sm text-gray-500 w-36 flex-shrink-0 font-medium">{key}</span>
                  <span className="text-sm text-gray-800 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">Mô tả sản phẩm</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>

        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-1 h-7 bg-blue-600 rounded-full inline-block" />
                Sản phẩm liên quan
              </h2>
              <Link href={`/danh-muc/${product.categorySlug}`}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-semibold group">
                Xem thêm <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
