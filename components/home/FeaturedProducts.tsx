import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface FeaturedProductsProps {
  products: Product[];
  title: string;
  viewAllLink?: string;
  icon?: string;
}

export default function FeaturedProducts({
  products,
  title,
  viewAllLink = "/san-pham",
  icon,
}: FeaturedProductsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2"
          style={{ fontFamily: "'Rubik', sans-serif" }}>
          <span className="w-1 h-7 bg-blue-600 rounded-full inline-block" />
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        <Link
          href={viewAllLink}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors group"
        >
          Xem tất cả
          <CaretRight size={15} weight="bold" className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:overflow-visible sm:pb-0">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-44 sm:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
