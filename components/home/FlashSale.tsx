"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Flame, Zap } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface FlashSaleProps {
  products: Product[];
}

function useCountdown(targetDate: string) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { h: 0, m: 0, s: 0 };
      return {
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      };
    };

    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return t;
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base font-black tabular-nums text-sky-700 shadow-sm sm:h-11 sm:w-11 sm:text-xl">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-0.5 text-[10px] font-bold text-sky-50">{label}</span>
    </div>
  );
}

export default function FlashSale({ products }: FlashSaleProps) {
  const flashProducts = products.filter((p) => p.isFlashSale && p.flashSaleEnd);
  const end = flashProducts[0]?.flashSaleEnd ?? "";
  const t = useCountdown(end);

  if (!flashProducts.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_18px_50px_-30px_rgba(2,132,199,.45)]">
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-500 px-4 py-4 sm:px-6">
        <div className="absolute inset-0 retail-grid-bg opacity-30" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/16 text-cyan-100 shadow-inner">
              <Flame size={28} />
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-white sm:text-3xl">
                Ưu đãi điện lạnh
                <Zap size={26} className="text-cyan-100" />
              </h2>
              <p className="text-sm font-semibold text-sky-50">Máy lạnh, máy giặt, tủ lạnh, máy nước nóng</p>
            </div>
            <div className="flex items-end gap-1.5 rounded-2xl bg-sky-950/20 p-2 backdrop-blur-sm">
              <Digit value={t.h} label="GIỜ" />
              <span className="pb-5 text-lg font-black text-white">:</span>
              <Digit value={t.m} label="PHÚT" />
              <span className="pb-5 text-lg font-black text-white">:</span>
              <Digit value={t.s} label="GIÂY" />
            </div>
          </div>

          <Link href="/san-pham?filter=flash-sale" className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50">
            Xem tất cả
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-b from-sky-50 to-white p-3 sm:p-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4 xl:grid-cols-5">
          {flashProducts.slice(0, 5).map((product, index) => (
            <div key={product.id} className="w-44 flex-shrink-0 sm:w-auto">
              <ProductCard product={product} showFlashSale priority={index < 4} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
