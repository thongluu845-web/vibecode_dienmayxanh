"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Phone, Share2 } from "lucide-react";
import { Banner } from "@/types";

interface HeroBannerProps {
  banners: Banner[];
}

const infoCards = [
  { Icon: Phone, value: "070.6767.921", label: "Hotline", href: "tel:0706767921" },
  { Icon: MessageCircle, value: "Zalo", label: "Tư vấn nhanh", href: "https://zalo.me/0706767921", external: true },
  { Icon: Share2, value: "Facebook", label: "Lưu Thảo", href: "https://www.facebook.com/thao.luuvanthao.18", external: true },
];

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [cur, setCur] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const next = useCallback(() => {
    setCur((p) => (p + 1) % banners.length);
    setAnimKey((k) => k + 1);
  }, [banners.length]);

  const prev = () => {
    setCur((p) => (p - 1 + banners.length) % banners.length);
    setAnimKey((k) => k + 1);
  };

  const goTo = (i: number) => {
    setCur(i);
    setAnimKey((k) => k + 1);
  };

  useEffect(() => {
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next]);

  if (!banners.length) return null;

  return (
    <div
      className="relative min-h-[210px] w-full overflow-hidden rounded-2xl border border-sky-100 bg-sky-700 shadow-[0_18px_50px_-28px_rgba(2,132,199,.55)] sm:min-h-0"
      style={{ aspectRatio: "16/6" }}
    >
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === cur ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
          aria-hidden={idx !== cur}
        >
          <div className="relative block h-full w-full">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              priority={idx === 0}
              sizes="(max-width:768px) 100vw,1200px"
              className="object-cover"
              style={{
                transform: idx === cur ? "scale(1)" : "scale(1.04)",
                transition: "transform 6s ease-out",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#075985_0%,rgba(2,132,199,.86)_30%,rgba(14,165,233,.30)_58%,transparent_82%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,0)_48%,rgba(8,47,73,.10))]" />
            <div className="absolute inset-0 flex items-center px-5 sm:px-8 lg:px-11">
              <div className="max-w-[28rem] text-white" key={`${animKey}-${idx}`}>
                <h2
                  className="max-w-[18rem] text-3xl font-black leading-[1.02] sm:max-w-none sm:text-4xl lg:text-5xl"
                  style={{
                    fontFamily: "'Rubik', sans-serif",
                    animation: idx === cur ? "fadeInLeft 0.55s 0.2s both" : "none",
                  }}
                >
                  {banner.title}
                </h2>
                <p
                  className="mt-3 text-sm font-semibold leading-relaxed text-sky-50 sm:text-base"
                  style={{ animation: idx === cur ? "fadeInLeft 0.55s 0.35s both" : "none" }}
                >
                  {banner.subtitle}
                </p>

                <div
                  className="mt-4 hidden max-w-[28rem] flex-wrap gap-2 sm:flex"
                  style={{ animation: idx === cur ? "fadeInLeft 0.55s 0.42s both" : "none" }}
                >
                  {infoCards.map(({ Icon, value, label, href, external }) => (
                    <a
                      key={label}
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      aria-label={`${label}: ${value}`}
                      className="min-w-[6.75rem] rounded-xl border border-white/25 bg-white/95 px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-sky-600">
                        <Icon size={13} />
                        {label}
                      </span>
                      <span className="block text-base font-black leading-tight text-sky-900 sm:text-lg">{value}</span>
                    </a>
                  ))}
                </div>

                <Link
                  href={banner.link}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-sky-700 shadow-lg shadow-sky-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50 active:scale-95"
                  style={{ animation: idx === cur ? "fadeInLeft 0.55s 0.5s both" : "none" }}
                >
                  Mua ngay
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {[
        { fn: prev, dir: "left", Icon: ChevronLeft, pos: "left-3" },
        { fn: next, dir: "right", Icon: ChevronRight, pos: "right-3" },
      ].map(({ fn, dir, Icon, pos }) => (
        <button
          key={dir}
          onClick={fn}
          className={`absolute ${pos} top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white active:scale-90 sm:flex`}
          aria-label={dir === "left" ? "Slide trước" : "Slide tiếp"}
        >
          <Icon size={20} className="text-gray-700" />
        </button>
      ))}

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === cur ? "w-7 bg-white shadow" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-3 right-4 z-20 hidden rounded-full bg-black/15 px-2 py-1 text-xs font-bold text-white/80 backdrop-blur-sm sm:block">
        {cur + 1} / {banners.length}
      </div>
    </div>
  );
}
