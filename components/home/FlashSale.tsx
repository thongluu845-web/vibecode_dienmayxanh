"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { HiLightningBolt } from "react-icons/hi";
import { MdLocalFireDepartment } from "react-icons/md";
import { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface FlashSaleProps { products: Product[] }

function useCountdown(targetDate: string) {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return {
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000)  % 60),
      s: Math.floor((diff / 1000)   % 60),
    };
  };
  const [t, setT] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000); // eslint-disable-line react-hooks/exhaustive-deps
    return () => clearInterval(id);
  }, [targetDate]); // eslint-disable-line react-hooks/exhaustive-deps
  return t;
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 text-white font-black text-base sm:text-xl w-9 sm:w-11 h-9 sm:h-11
        rounded-xl flex items-center justify-center tabular-nums
        shadow-inner ring-1 ring-white/10
        hover:ring-white/30 transition-all duration-200
      ">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] text-red-200 mt-0.5 font-medium">{label}</span>
    </div>
  );
}

export default function FlashSale({ products }: FlashSaleProps) {
  const flashProducts = products.filter((p) => p.isFlashSale && p.flashSaleEnd);
  const end = flashProducts[0]?.flashSaleEnd ?? "";
  const t = useCountdown(end);
  if (!flashProducts.length) return null;

  return (
    <section className="rounded-2xl overflow-hidden shadow-xl pulse-ring">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-500 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Title with fire icon */}
            <div className="flex items-center gap-2">
              <MdLocalFireDepartment
                size={26}
                className="text-yellow-300"
                style={{ animation: "pulseRing 1s ease-in-out infinite, spinSlow 3s linear infinite" }}
              />
              <HiLightningBolt size={20} className="text-yellow-300 float-anim" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-widest"
                style={{ fontFamily: "'Rubik', sans-serif", textShadow: "0 2px 8px rgba(0,0,0,.3)" }}>
                FLASH SALE
              </h2>
            </div>

            {/* Countdown */}
            <div className="flex items-end gap-1.5 bg-black/25 backdrop-blur-sm rounded-2xl px-3 py-2">
              <Digit value={t.h} label="GIỜ" />
              <span className="text-white font-black text-lg pb-5">:</span>
              <Digit value={t.m} label="PHÚT" />
              <span className="text-white font-black text-lg pb-5">:</span>
              <Digit value={t.s} label="GIÂY" />
            </div>
          </div>

          <Link href="/san-pham?filter=flash-sale"
            className="flex items-center gap-1.5 bg-white text-red-600 font-bold text-sm px-4 py-2.5 rounded-xl
              hover:bg-red-50 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 shine-hover">
            Xem tất cả <FiChevronRight size={15} />
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mt-3 bg-black/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (t.h * 3600 + t.m * 60 + t.s) / (8 * 3600) * 100)}%` }}
          />
        </div>
      </div>

      {/* Products — horizontal scroll mobile, grid desktop */}
      <div className="bg-gradient-to-b from-red-50 via-orange-50/50 to-white p-3 sm:p-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:overflow-visible">
          {flashProducts.slice(0, 5).map((product, i) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-44 sm:w-auto reveal"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <ProductCard product={product} showFlashSale />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
