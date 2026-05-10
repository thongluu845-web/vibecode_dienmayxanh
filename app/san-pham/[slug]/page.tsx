import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CaretRight, ShoppingCart, Heart, ShareNetwork,
  ShieldCheck, Truck, ArrowsClockwise, SealCheck, CreditCard,
} from "@phosphor-icons/react/dist/ssr";
import { getProductBySlug, products, formatPrice } from "@/lib/data";
import StarRating from "@/components/ui/StarRating";
import ProductCard from "@/components/product/ProductCard";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Sản phẩm không tồn tại" };
  return {
    title: `${product.name} – Giá ${formatPrice(product.price)}`,
    description: `${product.shortDescription}. Mua ${product.name} chính hãng tại Điện Máy Xanh, giao hàng nhanh, bảo hành tận nơi.`,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.thumbnail, alt: product.name }],
    },
  };
}

const policies = [
  { Icon: ShieldCheck,     text: "Hàng chính hãng 100%", color: "text-green-500"  },
  { Icon: Truck,           text: "Giao hàng 2-4 giờ",    color: "text-blue-500"   },
  { Icon: ArrowsClockwise, text: "Đổi trả 15 ngày",       color: "text-orange-500" },
  { Icon: SealCheck,       text: "Bảo hành 12 tháng",     color: "text-purple-500" },
];

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "VND",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Điện Máy Xanh" },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <CaretRight size={13} weight="bold" />
          <Link href={`/danh-muc/${product.categorySlug}`} className="hover:text-blue-600">{product.category}</Link>
          <CaretRight size={13} weight="bold" />
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 shadow-inner">
                <Image src={product.images[0]} alt={product.name} fill priority
                  sizes="(max-width:1024px) 100vw,50vw" className="object-cover" />
                {product.discount > 0 && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-sm px-3 py-1 rounded-xl shadow">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-200 cursor-pointer flex-shrink-0">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="64px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Link href={`/san-pham?brand=${product.brand.toLowerCase()}`}
                  className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline">
                  {product.brand}
                  <SealCheck size={15} weight="duotone" className="text-blue-400" />
                </Link>
                {product.isNew && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-lg">MỚI</span>}
                {product.stock < 10 && product.stock > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-lg">SẮP HẾT</span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} size={16} />
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">
                  Đã bán <strong className="text-gray-700">{product.sold.toLocaleString("vi-VN")}</strong>
                </span>
              </div>

              {/* Price box */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4 mb-5">
                <p className="text-3xl sm:text-4xl font-black text-red-600 mb-1">
                  {formatPrice(product.price)}
                </p>
                {product.originalPrice > product.price && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                      Tiết kiệm {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </div>
                )}
                {product.installmentAvailable && (
                  <p className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold mt-2">
                    <CreditCard size={16} weight="duotone" /> Trả góp 0% – duyệt nhanh 5 phút
                  </p>
                )}
              </div>

              {/* Short spec */}
              <div className="bg-gray-50 rounded-xl p-3 mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Điểm nổi bật</p>
                <p className="text-sm text-gray-700 font-medium">{product.shortDescription}</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mb-5 flex-wrap">
                <button className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-2xl text-base transition-colors shadow-md shadow-red-200 min-w-[140px]">
                  <ShoppingCart size={20} weight="bold" /> Mua ngay
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-3.5 px-4 rounded-2xl text-base transition-colors min-w-[140px]">
                  <ShoppingCart size={20} weight="bold" /> Thêm giỏ
                </button>
                <button className="w-12 h-12 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 rounded-2xl flex items-center justify-center text-gray-400 transition-colors flex-shrink-0 icon-pop" aria-label="Yêu thích">
                  <Heart size={20} weight="duotone" />
                </button>
                <button className="w-12 h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 rounded-2xl flex items-center justify-center text-gray-400 transition-colors flex-shrink-0" aria-label="Chia sẻ">
                  <ShareNetwork size={20} weight="duotone" />
                </button>
              </div>

              {/* Policy pills */}
              <div className="grid grid-cols-2 gap-2">
                {policies.map(({ Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    <Icon size={18} weight="duotone" className={`${color} flex-shrink-0`} />
                    <span className="text-xs font-medium text-gray-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Specs + Description */}
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

        {/* Related */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-1 h-7 bg-blue-600 rounded-full inline-block" />
                Sản phẩm liên quan
              </h2>
              <Link href={`/danh-muc/${product.categorySlug}`}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-semibold group">
                Xem thêm
                <CaretRight size={14} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
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
