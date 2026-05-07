"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiSearch, FiShoppingCart, FiPhone, FiMapPin,
  FiUser, FiMenu, FiX, FiChevronDown, FiChevronRight,
  FiHeart, FiBell
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { categories } from "@/lib/data";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartCount = 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top info bar */}
      <div className="bg-[#0a3d8f] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:18006789" className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors">
              <FiPhone size={12} />
              <span className="font-medium">1800 6789</span>
              <span className="text-blue-300">(Miễn phí)</span>
            </a>
            <span className="text-blue-400 hidden sm:block">|</span>
            <Link href="/he-thong-cua-hang" className="hidden sm:flex items-center gap-1.5 hover:text-yellow-300 transition-colors">
              <FiMapPin size={12} />
              <span>2.000+ Cửa hàng toàn quốc</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/tra-gop" className="hidden sm:flex items-center gap-1 hover:text-yellow-300 transition-colors">
              <HiOutlineSparkles size={12} />
              Trả góp 0%
            </Link>
            <span className="text-blue-400 hidden sm:block">|</span>
            <Link href="/tai-khoan" className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors">
              <FiUser size={12} />
              <span>Đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-gradient-to-r from-[#0055b3] to-[#0077e6] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 lg:gap-5">

            {/* Logo */}
            <Link href="/" aria-label="Điện Máy Xanh" className="flex-shrink-0">
              <div className="bg-white rounded-xl px-3 py-2 shadow-md flex flex-col items-center leading-none">
                <div className="flex items-center gap-0.5">
                  <span className="text-[#0055b3] font-black text-base sm:text-lg tracking-tight">ĐIỆN</span>
                  <span className="text-[#ff6600] font-black text-base sm:text-lg tracking-tight">MÁY</span>
                </div>
                <span className="text-[#0055b3] font-black text-base sm:text-lg tracking-tight -mt-1">XANH</span>
              </div>
            </Link>

            {/* Danh mục - desktop */}
            <div className="relative hidden lg:block flex-shrink-0">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border border-white/20"
              >
                <FiMenu size={17} />
                <span>Danh mục</span>
                <FiChevronDown size={15} className={`transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
              </button>

              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/danh-muc/${cat.slug}`}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors group"
                          onClick={() => setIsCategoryOpen(false)}
                        >
                          <div className="w-9 h-9 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-xl transition-colors flex-shrink-0">
                            {cat.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{cat.name}</p>
                            <p className="text-xs text-gray-400">{cat.productCount} sản phẩm</p>
                          </div>
                          <FiChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
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
                className="w-full py-2.5 pl-4 pr-12 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-3 focus:ring-yellow-400/50 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3.5 bg-[#ff6600] hover:bg-[#e55a00] text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <FiSearch size={17} />
              </button>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link href="/yeu-thich" className="hidden sm:flex w-10 h-10 items-center justify-center text-white hover:bg-white/20 rounded-xl transition-colors" aria-label="Yêu thích">
                <FiHeart size={21} />
              </Link>
              <Link href="/thong-bao" className="hidden sm:flex w-10 h-10 items-center justify-center text-white hover:bg-white/20 rounded-xl transition-colors" aria-label="Thông báo">
                <FiBell size={21} />
              </Link>
              <Link href="/gio-hang" className="relative flex w-10 h-10 items-center justify-center text-white hover:bg-white/20 rounded-xl transition-colors" aria-label="Giỏ hàng">
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#ff6600] text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden text-white hover:bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav bar - desktop */}
      <nav className="bg-[#0047a3] hidden lg:block" aria-label="Danh mục">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <li key={cat.id} className="flex-shrink-0">
                <Link
                  href={`/danh-muc/${cat.slug}`}
                  className="flex items-center gap-1.5 text-white/90 hover:text-white hover:bg-white/15 px-3.5 py-2.5 text-sm whitespace-nowrap transition-colors font-medium"
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          {/* Mobile search */}
          <div className="p-3 border-b border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full py-2.5 pl-4 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              />
              <button type="submit" className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 text-white rounded-lg">
                <FiSearch size={16} />
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.productCount} sản phẩm</p>
                </div>
                <FiChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}
          </div>

          {/* Mobile quick links */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-3">
            <a href="tel:18006789" className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium">
              <FiPhone size={15} className="text-blue-600" />
              1800 6789
            </a>
            <Link href="/gio-hang" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              <FiShoppingCart size={15} />
              Giỏ hàng
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
