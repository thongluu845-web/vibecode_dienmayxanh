import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
}

const categoryColors: Record<string, string> = {
  "dien-thoai":   "from-violet-500 to-purple-600",
  "laptop":       "from-blue-500 to-cyan-600",
  "tivi":         "from-rose-500 to-pink-600",
  "tu-lanh":      "from-sky-500 to-blue-600",
  "may-giat":     "from-teal-500 to-emerald-600",
  "dieu-hoa":     "from-cyan-500 to-blue-500",
  "may-tinh-bang":"from-orange-500 to-amber-600",
  "am-thanh":     "from-fuchsia-500 to-pink-600",
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section aria-labelledby="category-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="category-heading" className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
          <span className="w-1 h-7 bg-blue-600 rounded-full inline-block" />
          Danh mục sản phẩm
        </h2>
        <Link href="/san-pham" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold">
          Tất cả <FiChevronRight size={15} />
        </Link>
      </div>

      {/* Scrollable on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible md:grid-cols-8">
        {categories.map((cat) => {
          const gradient = categoryColors[cat.slug] ?? "from-gray-400 to-gray-600";
          return (
            <Link
              key={cat.id}
              href={`/danh-muc/${cat.slug}`}
              className="group flex-shrink-0 w-20 sm:w-auto flex flex-col items-center gap-2"
            >
              {/* Icon circle */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl sm:text-3xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                {cat.icon}
              </div>
              {/* Label */}
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-blue-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
