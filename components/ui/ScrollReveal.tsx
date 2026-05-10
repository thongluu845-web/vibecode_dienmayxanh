"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: "up" | "left" | "right" | "zoom";
  delay?: 0 | 100 | 150 | 200 | 300 | 400 | 500;
  once?: boolean;
}

const variantClass = {
  up:    "reveal",
  left:  "reveal-left",
  right: "reveal-right",
  zoom:  "reveal-zoom",
};

const delayClass: Record<number, string> = {
  0: "", 100: "delay-100", 150: "delay-150",
  200: "delay-200", 300: "delay-300",
  400: "delay-400", 500: "delay-500",
};

export default function ScrollReveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove("is-visible");
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const base = variantClass[variant];
  const d    = delayClass[delay] ?? "";

  return (
    <div ref={ref} className={`${base} ${d} ${className}`}>
      {children}
    </div>
  );
}
