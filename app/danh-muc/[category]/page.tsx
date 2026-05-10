import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import { categories, getProductsByCategory } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";

interface Props { params: Promise<{ category: string }> }

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return { title: "Danh mục không tồn tại" };
  return {
    title: `${cat.name} – Chính hãng, giá tốt | Điện Máy Xanh`,
    description: `Mua ${cat.name} chính hãng tại Điện Máy Xanh. ${cat.description}. Giá rẻ nhất, giao hàng nhanh.`,
    alternates: { canonical: `https://dienmayxanh.com/danh-muc/${category}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();
  const catProducts = getProductsByCategory(category);
  const jsonLd = { "@context": "https://schema.org", "@type": "CollectionPage", name: cat.name, description: cat.description, url: `https://dienmayxanh.com/danh-muc/${category}` };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <nav className="text-xs text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRightOutlined style={{ fontSize: 13 }} />
          <span className="text-gray-800 font-medium">{cat.name}</span>
        </nav>

        <div className="bg-gradient-to-r from-[#0055b3] to-[#0077e6] rounded-2xl p-6 sm:p-8 mb-7 text-white shadow-lg">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0">{cat.icon}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-1">{cat.name}</h1>
              <p className="text-blue-200 text-sm mb-2">{cat.description}</p>
              <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-xl">{cat.productCount} sản phẩm</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => (
            <Link key={c.id} href={`/danh-muc/${c.slug}`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${c.slug === category ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm"}`}>
              <span>{c.icon}</span><span>{c.name}</span>
            </Link>
          ))}
        </div>

        {catProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">{cat.icon}</div>
            <p className="text-gray-600 font-bold text-lg mb-2">Đang cập nhật sản phẩm {cat.name}</p>
            <p className="text-gray-400 text-sm mb-6">Chúng tôi đang bổ sung sản phẩm vào danh mục này</p>
            <Link href="/san-pham" className="inline-block bg-blue-600 text-white px-7 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors">Xem tất cả sản phẩm</Link>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-500 mb-4">Hiển thị <strong className="text-gray-800">{catProducts.length}</strong> sản phẩm</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {catProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
