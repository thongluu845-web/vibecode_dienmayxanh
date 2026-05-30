import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Category } from "@/types";
import CategoryIcon from "@/components/ui/CategoryIcon";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-950 sm:text-2xl">Danh mục nổi bật</h2>
          <p className="mt-1 hidden text-sm font-medium text-gray-500 sm:block">Chọn nhanh nhóm sản phẩm bạn cần mua hôm nay</p>
        </div>
        <Link href="/san-pham" className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100">
          Tất cả
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/danh-muc/${cat.slug}`}
            className="group flex w-28 flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/70 sm:w-auto"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-blue-50">
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width:640px) 112px,160px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/35 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                <CategoryIcon slug={cat.slug} size={19} />
              </span>
            </div>
            <div className="min-h-[4.6rem] p-3">
              <h3 className="text-sm font-black leading-tight text-gray-900 group-hover:text-blue-700">{cat.name}</h3>
              <p className="mt-1 text-xs font-semibold text-gray-400">{cat.productCount} sản phẩm</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
