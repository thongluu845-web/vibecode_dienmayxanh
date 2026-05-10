"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { CaretLeft, CaretRight, ArrowRight } from "@phosphor-icons/react";
import { Banner } from "@/types";

interface HeroBannerProps { banners: Banner[] }

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [cur, setCur]         = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const next = useCallback(() => {
    setCur((p) => (p + 1) % banners.length);
    setAnimKey((k) => k + 1);
  }, [banners.length]);

  const prev = () => {
    setCur((p) => (p - 1 + banners.length) % banners.length);
    setAnimKey((k) => k + 1);
  };

  const goTo = (i: number) => { setCur(i); setAnimKey((k) => k + 1); };

  useEffect(() => {
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next]);

  if (!banners.length) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: "16/6" }}>
      {/* Slides */}
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
              sizes="(max-width:768px) 100vw,1200px"
              className="object-cover"
              style={{ transform: idx === cur ? "scale(1.02)" : "scale(1.08)", transition: "transform 6s ease-out" }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

            {/* Text content */}
            <div className="absolute inset-0 flex items-center px-8 sm:px-12">
              <div className="max-w-sm text-white" key={`${animKey}-${idx}`}>
                <p
                  className="text-xs sm:text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2"
                  style={{ animation: idx === cur ? "fadeInLeft 0.5s 0.1s both" : "none" }}
                >
                  ⚡ Siêu ưu đãi hôm nay
                </p>
                <h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-3 drop-shadow-lg"
                  style={{
                    fontFamily: "'Rubik', sans-serif",
                    animation: idx === cur ? "fadeInLeft 0.55s 0.2s both" : "none",
                  }}
                >
                  {banner.title}
                </h2>
                <p
                  className="text-sm sm:text-base text-gray-200 mb-5"
                  style={{ animation: idx === cur ? "fadeInLeft 0.55s 0.35s both" : "none" }}
                >
                  {banner.subtitle}
                </p>
                <span
                  className="inline-flex items-center gap-2 bg-[#ff6600] hover:bg-[#e55a00] text-white
                    font-bold px-6 py-3 rounded-2xl text-sm transition-all duration-200
                    shadow-lg shadow-orange-500/40 hover:shadow-xl hover:shadow-orange-500/50
                    hover:-translate-y-0.5 active:scale-95 shine-hover"
                  style={{ animation: idx === cur ? "fadeInLeft 0.55s 0.5s both" : "none" }}
                >
                  Mua ngay
                  <ArrowRight size={16} weight="bold" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}

      {/* Arrow buttons */}
      {[
        { fn: prev, dir: "left",  Icon: CaretLeft,  pos: "left-3"  },
        { fn: next, dir: "right", Icon: CaretRight, pos: "right-3" },
      ].map(({ fn, dir, Icon, pos }) => (
        <button key={dir} onClick={fn}
          className={`absolute ${pos} top-1/2 -translate-y-1/2 z-20
            w-9 h-9 bg-white/80 hover:bg-white rounded-full
            flex items-center justify-center shadow-lg
            transition-all duration-200 hover:scale-110 active:scale-90`}
          aria-label={dir === "left" ? "Slide trước" : "Slide tiếp"}
        >
          <Icon size={20} weight="bold" className="text-gray-700" />
        </button>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {banners.map((_, idx) => (
          <button key={idx} onClick={() => goTo(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === cur ? "w-7 bg-white shadow" : "w-2 bg-white/50 hover:bg-white/70"}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-3 right-4 z-20 text-xs text-white/70 font-medium">
        {cur + 1} / {banners.length}
      </div>
    </div>
  );
}
