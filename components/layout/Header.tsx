"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SearchOutlined         from "@mui/icons-material/SearchOutlined";
import ShoppingCartOutlined   from "@mui/icons-material/ShoppingCartOutlined";
import LocalPhoneOutlined     from "@mui/icons-material/LocalPhoneOutlined";
import PlaceOutlined          from "@mui/icons-material/PlaceOutlined";
import PersonOutlined         from "@mui/icons-material/PersonOutlined";
import MenuOutlined           from "@mui/icons-material/MenuOutlined";
import CloseOutlined          from "@mui/icons-material/CloseOutlined";
import ExpandMoreOutlined     from "@mui/icons-material/ExpandMoreOutlined";
import ChevronRightOutlined   from "@mui/icons-material/ChevronRightOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import NotificationsOutlined  from "@mui/icons-material/NotificationsOutlined";
import AutoAwesome            from "@mui/icons-material/AutoAwesome";
import { categories } from "@/lib/data";

export default function Header() {
  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [scrolled,       setScrolled]       = useState(false);
  const cartCount = 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim())
      window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-shadow duration-300 ${scrolled ? "shadow-2xl shadow-blue-900/30" : "shadow-md"}`}>

      {/* ── Top bar ── */}
      <div className="bg-[#0a3d8f] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:18006789" className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors group">
              <LocalPhoneOutlined style={{ fontSize: 13 }} className="text-green-400 group-hover:text-yellow-300 icon-wiggle" />
              <span className="font-semibold">1800 6789</span>
              <span className="text-blue-300 hidden sm:inline">(Miễn phí)</span>
            </a>
            <span className="text-blue-400 hidden sm:block">|</span>
            <Link href="/he-thong-cua-hang" className="hidden sm:flex items-center gap-1.5 hover:text-yellow-300 transition-colors group">
              <PlaceOutlined style={{ fontSize: 13 }} className="text-red-400 group-hover:text-yellow-300" />
              <span>2.000+ Cửa hàng</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/tra-gop" className="hidden sm:flex items-center gap-1 hover:text-yellow-300 transition-colors group">
              <AutoAwesome style={{ fontSize: 13 }} className="text-yellow-400 group-hover:text-yellow-300" />
              Trả góp 0%
            </Link>
            <span className="text-blue-400 hidden sm:block">|</span>
            <Link href="/tai-khoan" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all hover:text-yellow-300">
              <PersonOutlined style={{ fontSize: 13 }} className="text-blue-200" />
              <span>Đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <div className={`bg-gradient-to-r from-[#0055b3] to-[#0077e6] transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 lg:gap-5">

            {/* Logo */}
            <Link href="/" aria-label="Điện Máy Xanh" className="flex-shrink-0 group">
              <div className="bg-white rounded-xl px-3 py-2 shadow-md flex flex-col items-center leading-none group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                <div className="flex items-center gap-0.5">
                  <span className="text-[#0055b3] font-black text-base sm:text-lg tracking-tight" style={{ fontFamily: "'Rubik', sans-serif" }}>ĐIỆN</span>
                  <span className="text-[#ff6600] font-black text-base sm:text-lg tracking-tight"  style={{ fontFamily: "'Rubik', sans-serif" }}>MÁY</span>
                </div>
                <span className="text-[#0055b3] font-black text-base sm:text-lg tracking-tight -mt-1" style={{ fontFamily: "'Rubik', sans-serif" }}>XANH</span>
              </div>
            </Link>

            {/* Danh mục dropdown */}
            <div className="relative hidden lg:block flex-shrink-0">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border border-white/20 active:scale-95"
              >
                <MenuOutlined style={{ fontSize: 18 }} />
                <span>Danh mục</span>
                <ExpandMoreOutlined
                  style={{ fontSize: 16 }}
                  className={`transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slide-down">
                    <div className="p-2">
                      {categories.map((cat, i) => (
                        <Link key={cat.id} href={`/danh-muc/${cat.slug}`}
                          style={{ animationDelay: `${i * 30}ms` }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors duration-150 group cursor-pointer"
                          onClick={() => setIsCategoryOpen(false)}
                        >
                          <div className="w-9 h-9 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-xl transition-all duration-200 group-hover:scale-110 flex-shrink-0">
                            {cat.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{cat.name}</p>
                            <p className="text-xs text-gray-400">{cat.productCount} sản phẩm</p>
                          </div>
                          <ChevronRightOutlined style={{ fontSize: 15 }} className="text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative" role="search">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm điện thoại, laptop, tivi..."
                className="w-full py-2.5 pl-4 pr-20 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-3 focus:ring-yellow-400/60 shadow-inner"
              />
              <button type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 bg-[#ff6600] hover:bg-[#e55a00] text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 font-bold text-sm hover:scale-105 active:scale-95 shine-hover">
                <SearchOutlined style={{ fontSize: 17 }} />
                <span className="hidden sm:inline">Tìm</span>
              </button>
            </form>

            {/* Action icons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Wishlist */}
              <Link href="/yeu-thich" aria-label="Yêu thích"
                className="hidden sm:flex flex-col items-center gap-0.5 group cursor-pointer">
                <div className="w-9 h-9 bg-white/15 group-hover:bg-pink-500 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-90 icon-pop">
                  <FavoriteBorderOutlined style={{ fontSize: 19 }} className="text-pink-200 group-hover:text-white" />
                </div>
                <span className="text-[9px] text-white/60 group-hover:text-pink-200 transition-colors leading-none">Yêu thích</span>
              </Link>

              {/* Bell */}
              <Link href="/thong-bao" aria-label="Thông báo"
                className="hidden sm:flex flex-col items-center gap-0.5 group cursor-pointer">
                <div className="w-9 h-9 bg-white/15 group-hover:bg-amber-400 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-90 icon-wiggle">
                  <NotificationsOutlined style={{ fontSize: 19 }} className="text-yellow-200 group-hover:text-white" />
                </div>
                <span className="text-[9px] text-white/60 group-hover:text-yellow-200 transition-colors leading-none">Thông báo</span>
              </Link>

              {/* Cart — orange, always visible */}
              <Link href="/gio-hang" aria-label="Giỏ hàng"
                className="relative flex flex-col items-center gap-0.5 group cursor-pointer">
                <div className="w-10 h-10 bg-[#ff6600] group-hover:bg-[#e55a00] rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-90 icon-bounce shadow-lg shadow-orange-500/50">
                  <ShoppingCartOutlined style={{ fontSize: 20 }} className="text-white" />
                </div>
                <span className="text-[9px] text-white/60 group-hover:text-orange-200 transition-colors leading-none">Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 right-0 bg-white text-[#ff6600] text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 float-anim shadow">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden text-white hover:bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <span className={`transition-all duration-200 ${isMenuOpen ? "rotate-90 scale-110" : ""}`}>
                {isMenuOpen
                  ? <CloseOutlined style={{ fontSize: 22 }} />
                  : <MenuOutlined  style={{ fontSize: 22 }} />
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Category nav desktop ── */}
      <nav className="bg-[#0047a3] hidden lg:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <li key={cat.id} className="flex-shrink-0">
                <Link href={`/danh-muc/${cat.slug}`}
                  className="flex items-center gap-1.5 text-white/90 hover:text-white hover:bg-white/15 px-3.5 py-2.5 text-sm whitespace-nowrap transition-all duration-200 font-medium group">
                  <span className="text-base group-hover:scale-125 transition-transform duration-200">{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl animate-slide-down">
          <div className="p-3 border-b border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full py-2.5 pl-4 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
              <button type="submit" className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                <SearchOutlined style={{ fontSize: 16 }} />
              </button>
            </form>
          </div>
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            {categories.map((cat, i) => (
              <Link key={cat.id} href={`/danh-muc/${cat.slug}`}
                style={{ animationDelay: `${i * 25}ms` }}
                className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.productCount} sản phẩm</p>
                </div>
                <ChevronRightOutlined style={{ fontSize: 16 }} className="text-gray-300" />
              </Link>
            ))}
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-3">
            <a href="tel:18006789" className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium">
              <LocalPhoneOutlined style={{ fontSize: 15 }} className="text-blue-600" />1800 6789
            </a>
            <Link href="/gio-hang" onClick={() => setIsMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium">
              <ShoppingCartOutlined style={{ fontSize: 15 }} />Giỏ hàng
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
