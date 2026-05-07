"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Banner } from "@/types";

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [cur, setCur] = useState(0);

  const next = useCallback(() => setCur((p) => (p + 1) % banners.length), [banners.length]);
  const prev = () => setCur((p) => (p - 1 + banners.length) % banners.length);

  useEffect(() => {
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next]);

  if (!banners.length) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "16/6" }}>
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === cur ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          aria-hidden={idx !== cur}
        >
          <Link href={banner.link} className="block w-full h-full">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              priority={idx === 0}
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent">
              <div className="h-full flex items-center px-8 sm:px-12">
                <div className="max-w-sm text-white">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-2 drop-shadow">
                    {banner.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-200 mb-5">{banner.subtitle}</p>
                  <span className="inline-flex items-center gap-2 bg-[#ff6600] hover:bg-[#e55a00] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-lg">
                    Mua ngay <FiChevronRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        aria-label="Slide trước"
      >
        <FiChevronLeft size={19} className="text-gray-700" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        aria-label="Slide tiếp"
      >
        <FiChevronRight size={19} className="text-gray-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCur(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === cur ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
