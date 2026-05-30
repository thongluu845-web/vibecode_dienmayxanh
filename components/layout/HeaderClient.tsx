"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Bell, ChevronRight, MapPin, Menu, Phone, Repeat2, Search, ShoppingCart, UserIcon, X } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { CART_CHANGED_EVENT, CART_STORAGE_KEY, fetchCartSnapshot } from "@/lib/cart";
import { createClient, hasSupabaseClientConfig } from "@/lib/supabase/client";
import type { Category } from "@/types";

type HeaderClientProps = {
  categories: Category[];
};

const phoneDisplay = "070.6767.921";
const phoneHref = "tel:0706767921";
const zaloHref = "https://zalo.me/0706767921";
const facebookHref = "https://www.facebook.com/thao.luuvanthao.18";
const address = "24 Ung Văn Khiêm, Đông Xuyên, TP. Long Xuyên, An Giang";
const googleAvatarHosts = new Set([
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
]);

type HeaderAccount = {
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  initials: string;
};

type AuthMetadata = Record<string, unknown> | undefined;

function getMetadata(user: User | null): AuthMetadata {
  const metadata = user?.user_metadata;

  return metadata && typeof metadata === "object"
    ? (metadata as Record<string, unknown>)
    : undefined;
}

function getMetadataString(metadata: AuthMetadata, keys: string[]): string | null {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getSafeGoogleAvatarUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || !googleAvatarHosts.has(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function getInitials(displayName: string | null, email: string | null): string {
  const source = displayName ?? email?.split("@")[0] ?? "TK";
  const words = source.replace(/[_\-.]+/g, " ").split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

  return initials ? initials.toLocaleUpperCase("vi-VN") : "TK";
}

function getHeaderAccount(user: User | null): HeaderAccount | null {
  if (!user) return null;

  const metadata = getMetadata(user);
  const displayName = getMetadataString(metadata, ["full_name", "name"]);
  const avatarUrl = getSafeGoogleAvatarUrl(
    getMetadataString(metadata, ["avatar_url", "picture"]),
  );
  const email = user.email ?? null;

  return {
    email,
    displayName,
    avatarUrl,
    initials: getInitials(displayName, email),
  };
}

export default function HeaderClient({ categories }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [account, setAccount] = useState<HeaderAccount | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isCategoryMenuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && !categoryMenuRef.current?.contains(target)) {
        setIsCategoryMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCategoryMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isCategoryMenuOpen]);

  useEffect(() => {
    if (!hasSupabaseClientConfig()) return;

    const supabase = createClient();
    let active = true;

    void supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!active) return;
        setAccount(error ? null : getHeaderAccount(data.user));
        window.dispatchEvent(new Event(CART_CHANGED_EVENT));
      })
      .catch(() => {
        if (active) setAccount(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccount(getHeaderAccount(session?.user ?? null));
      window.dispatchEvent(new Event(CART_CHANGED_EVENT));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const refreshCartCount = () => {
      void fetchCartSnapshot()
        .then((snapshot) => {
          if (active) setCartCount(snapshot.count);
        })
        .catch(() => {
          if (active) setCartCount(0);
        });
    };

    const onCartChanged = (event: Event) => {
      const snapshot = (event as CustomEvent<{ count?: number }>).detail;

      if (typeof snapshot?.count === "number") {
        setCartCount(snapshot.count);
        return;
      }

      refreshCartCount();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        refreshCartCount();
      }
    };

    refreshCartCount();
    window.addEventListener(CART_CHANGED_EVENT, onCartChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      active = false;
      window.removeEventListener(CART_CHANGED_EVENT, onCartChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) window.location.href = `/tim-kiem?q=${encodeURIComponent(q)}`;
  };

  const accountLabel = account?.displayName ?? account?.email ?? "Tài khoản";
  const accountTitle = account
    ? `${account.displayName ?? "Tài khoản"}${account.email ? ` - ${account.email}` : ""}`
    : "Tài khoản";

  return (
    <header className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${scrolled ? "shadow-xl shadow-sky-950/10" : "shadow-sm"}`}>
      <div className="bg-sky-700 text-white">
        <div className="container-custom flex min-h-9 items-center justify-between gap-3 py-1 text-xs">
          <div className="flex min-w-0 items-center gap-4">
            <a href={phoneHref} className="flex items-center gap-1.5 font-black hover:text-cyan-100">
              <Phone size={14} />
              {phoneDisplay}
            </a>
            <span className="hidden min-w-0 items-center gap-1.5 text-sky-50 sm:flex">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="truncate">{address}</span>
            </span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <a href={facebookHref} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/12 px-2.5 py-1 font-bold hover:bg-white/20">
              Facebook
            </a>
            <a href={zaloHref} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/12 px-2.5 py-1 font-bold hover:bg-white/20">
              Zalo
            </a>
          </div>
        </div>
      </div>

      <div className={`border-b border-sky-100 bg-white transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
        <div className="container-custom">
          <div className="flex items-center gap-3 lg:gap-5">
            <Link href="/" aria-label="Điện Máy Lưu Thảo" className="flex-shrink-0">
              <BrandLogo className="rounded-2xl bg-white px-2.5 py-1.5 ring-1 ring-sky-100 transition hover:bg-sky-50 sm:px-3" />
            </Link>

            <form onSubmit={handleSearch} className="relative flex-1" role="search">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm máy lạnh, tủ lạnh, máy giặt..."
                className="h-11 w-full rounded-2xl border border-sky-100 bg-sky-50/70 pl-4 pr-14 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 flex h-9 w-11 items-center justify-center rounded-xl bg-sky-600 text-white transition hover:bg-sky-700 active:scale-95"
                aria-label="Tìm kiếm"
              >
                <Search size={19} />
              </button>
            </form>

            <Link href="/san-pham?filter=flash-sale" className="hidden items-center gap-1.5 rounded-2xl bg-cyan-600 px-3 py-2.5 text-sm font-black text-white shadow-sm shadow-cyan-200 transition hover:bg-cyan-700 lg:flex">
              <Repeat2 size={18} />
              Thu máy cũ
            </Link>

            <Link href="/tai-khoan" aria-label={accountTitle} title={accountTitle} className="hidden max-w-20 flex-col items-center gap-0.5 text-sky-700 sm:flex">
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-sky-50 ring-1 ring-sky-100 transition hover:bg-sky-100">
                {account?.avatarUrl ? (
                  <Image
                    src={account.avatarUrl}
                    alt={account.displayName ?? account.email ?? "Tài khoản"}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : account ? (
                  <span className="flex h-full w-full items-center justify-center bg-sky-600 text-xs font-black text-white">
                    {account.initials}
                  </span>
                ) : (
                  <UserIcon size={20} />
                )}
              </span>
              <span className="block max-w-full truncate text-[10px] font-bold leading-none">
                {account ? accountLabel : "Tài khoản"}
              </span>
            </Link>

            <Link href="/thong-bao" aria-label="Thông báo" className="hidden flex-col items-center gap-0.5 text-sky-700 sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 transition hover:bg-sky-100">
                <Bell size={20} />
              </span>
              <span className="text-[10px] font-bold leading-none">Thông báo</span>
            </Link>

            <Link href="/gio-hang" aria-label="Giỏ hàng" className="group relative flex flex-col items-center gap-0.5 text-sky-700">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 shadow-lg shadow-sky-500/20 transition group-hover:bg-sky-700">
                <ShoppingCart size={20} className="text-white" />
              </span>
              <span className="hidden text-[10px] font-bold leading-none sm:block">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-100 px-1 text-[10px] font-black text-sky-700">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white transition hover:bg-sky-700 lg:hidden"
              onClick={() => {
                setIsMenuOpen((open) => !open);
                setIsCategoryMenuOpen(false);
              }}
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <nav className="hidden border-b border-sky-100 bg-sky-50/80 lg:block">
        <div className="container-custom flex items-center gap-2 py-2">
          <div ref={categoryMenuRef} className="relative flex-shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isCategoryMenuOpen}
              aria-controls="desktop-category-menu"
              className="flex items-center gap-2 rounded-2xl bg-sky-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
              onClick={() => setIsCategoryMenuOpen((open) => !open)}
            >
              <Menu size={18} />
              Danh mục điện lạnh
              <ChevronRight size={16} className={`transition-transform ${isCategoryMenuOpen ? "rotate-90" : ""}`} />
            </button>

            {isCategoryMenuOpen && (
              <div
                id="desktop-category-menu"
                role="menu"
                className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-sky-100 bg-white p-2 shadow-2xl shadow-sky-950/15"
              >
                <Link
                  href="/san-pham"
                  role="menuitem"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-sky-50 hover:text-sky-700"
                  onClick={() => setIsCategoryMenuOpen(false)}
                >
                  <span>Tất cả sản phẩm</span>
                  <ChevronRight size={16} className="text-sky-600" />
                </Link>
                <div className="my-1 h-px bg-sky-50" />
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/danh-muc/${cat.slug}`}
                    role="menuitem"
                    className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                    onClick={() => setIsCategoryMenuOpen(false)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                        <CategoryIcon slug={cat.slug} size={17} />
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="flex-shrink-0 text-xs font-bold text-slate-400">{cat.productCount}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/san-pham?filter=flash-sale" className="ml-auto flex flex-shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold text-cyan-700 hover:bg-white">
            Có thu máy cũ
            <ChevronRight size={16} />
          </Link>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-sky-100 bg-white shadow-xl lg:hidden">
          <div className="max-h-[70vh] overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/danh-muc/${cat.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-3 transition hover:border-sky-200 hover:bg-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                    <CategoryIcon slug={cat.slug} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-800">{cat.name}</span>
                    <span className="block text-xs text-slate-400">{cat.productCount} sản phẩm</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/tai-khoan" className="flex items-center justify-center gap-2 rounded-2xl border border-sky-100 py-2.5 text-sm font-bold text-slate-700" onClick={() => setIsMenuOpen(false)}>
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-xl bg-sky-50 text-sky-700">
                  {account?.avatarUrl ? (
                    <Image
                      src={account.avatarUrl}
                      alt={account.displayName ?? account.email ?? "Tài khoản"}
                      width={28}
                      height={28}
                      className="h-full w-full object-cover"
                    />
                  ) : account ? (
                    <span className="flex h-full w-full items-center justify-center bg-sky-600 text-[10px] font-black text-white">
                      {account.initials}
                    </span>
                  ) : (
                    <UserIcon size={16} />
                  )}
                </span>
                <span className="min-w-0 truncate">{account ? accountLabel : "Tài khoản"}</span>
              </Link>
              <Link href="/thong-bao" className="flex items-center justify-center gap-2 rounded-2xl border border-sky-100 py-2.5 text-sm font-bold text-slate-700" onClick={() => setIsMenuOpen(false)}>
                <Bell size={16} className="text-sky-600" />
                Thông báo
              </Link>
              <a href={phoneHref} className="flex items-center justify-center gap-2 rounded-2xl border border-sky-100 py-2.5 text-sm font-bold text-slate-700">
                <Phone size={16} className="text-sky-600" />
                {phoneDisplay}
              </a>
              <a href={zaloHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-2xl bg-cyan-600 py-2.5 text-sm font-bold text-white">
                Zalo tư vấn
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
