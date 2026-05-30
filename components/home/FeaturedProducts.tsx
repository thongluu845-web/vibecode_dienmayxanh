import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface FeaturedProductsProps {
  products: Product[];
  title: string;
  viewAllLink?: string;
  icon?: ReactNode;
  eyebrow?: string;
}

export default function FeaturedProducts({
  products,
  title,
  viewAllLink = "/san-pham",
  icon,
  eyebrow,
}: FeaturedProductsProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="mb-1 text-xs font-black uppercase text-blue-600">{eyebrow}</p>}
          <h2 className="flex items-center gap-2 text-xl font-black text-gray-950 sm:text-2xl">
            {icon && <span className="inline-flex text-blue-600">{icon}</span>}
            {title}
          </h2>
        </div>
        <Link href={viewAllLink} className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100">
          Xem tất cả
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product, index) => (
          <div key={product.id} className="w-44 flex-shrink-0 sm:w-auto">
            <ProductCard product={product} priority={index < 4} />
          </div>
        ))}
      </div>
    </section>
  );
}
