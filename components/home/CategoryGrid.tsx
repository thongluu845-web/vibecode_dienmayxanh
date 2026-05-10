import Link from "next/link";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import { Category } from "@/types";

interface CategoryGridProps { categories: Category[] }

const categoryColors: Record<string, { from: string; to: string; shadow: string }> = {
  "dien-thoai":    { from: "#7c3aed", to: "#a855f7", shadow: "shadow-purple-200"  },
  "laptop":        { from: "#2563eb", to: "#06b6d4", shadow: "shadow-blue-200"    },
  "tivi":          { from: "#db2777", to: "#f43f5e", shadow: "shadow-pink-200"    },
  "tu-lanh":       { from: "#0284c7", to: "#38bdf8", shadow: "shadow-sky-200"     },
  "may-giat":      { from: "#059669", to: "#34d399", shadow: "shadow-emerald-200" },
  "dieu-hoa":      { from: "#0891b2", to: "#22d3ee", shadow: "shadow-cyan-200"    },
  "may-tinh-bang": { from: "#d97706", to: "#fbbf24", shadow: "shadow-amber-200"   },
  "am-thanh":      { from: "#c026d3", to: "#e879f9", shadow: "shadow-fuchsia-200" },
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2" style={{ fontFamily: "'Rubik', sans-serif" }}>
          <span className="w-1 h-7 bg-blue-600 rounded-full inline-block" />
          Danh mục sản phẩm
        </h2>
        <Link href="/san-pham" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors group">
          Tất cả
          <ChevronRightOutlined style={{ fontSize: 15 }} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible md:grid-cols-8 sm:pb-0">
        {categories.map((cat, i) => {
          const c = categoryColors[cat.slug] ?? { from: "#64748b", to: "#94a3b8", shadow: "shadow-gray-200" };
          return (
            <Link key={cat.id} href={`/danh-muc/${cat.slug}`}
              className="group flex-shrink-0 w-[72px] sm:w-auto flex flex-col items-center gap-2.5 cursor-pointer"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl
                  shadow-lg ${c.shadow} group-hover:shadow-xl group-hover:scale-110 group-hover:-translate-y-1
                  transition-all duration-300 ease-out overflow-hidden`}
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                <div className="absolute inset-0 rounded-2xl ring-2 ring-white/30 group-hover:ring-white/60 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-600 text-center leading-tight group-hover:text-blue-600 transition-colors duration-200 max-w-[72px]">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
