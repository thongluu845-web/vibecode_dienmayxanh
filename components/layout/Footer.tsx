import Link from "next/link";
import { MapPin, Phone, RefreshCw, Repeat2, Share2, ShieldCheck, Truck } from "lucide-react";
import { applianceBrands } from "@/lib/brand-assets";
import ApplianceBrandLogo from "@/components/brand/ApplianceBrandLogo";
import BrandLogo from "@/components/brand/BrandLogo";

const phoneDisplay = "070.6767.921";
const phoneHref = "tel:0706767921";
const zaloHref = "https://zalo.me/0706767921";
const facebookHref = "https://www.facebook.com/thao.luuvanthao.18";
const address = "24 Ung Văn Khiêm, Đông Xuyên, TP. Long Xuyên, An Giang";

const footerCategories = [
  { name: "Máy lạnh", href: "/danh-muc/may-lanh" },
  { name: "Máy giặt", href: "/danh-muc/may-giat" },
  { name: "Tủ lạnh", href: "/danh-muc/tu-lanh" },
  { name: "Máy nước nóng", href: "/danh-muc/may-nuoc-nong" },
];

const services = [
  { name: "Mua bán điện lạnh", href: "/san-pham" },
  { name: "Lắp đặt - bảo trì", href: "/san-pham" },
  { name: "Sửa chữa - vệ sinh", href: "/san-pham" },
  { name: "Thu máy cũ", href: "/san-pham?filter=flash-sale" },
];

const benefits = [
  { Icon: Truck, title: "Giao lắp nhanh", desc: "Tận nơi trong ngày" },
  { Icon: ShieldCheck, title: "Uy tín", desc: "Kỹ thuật rõ ràng" },
  { Icon: Repeat2, title: "Thu máy cũ", desc: "Đổi máy bù tiền" },
  { Icon: RefreshCw, title: "Bảo trì - vệ sinh", desc: "Máy lạnh, tủ lạnh, máy giặt" },
];

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-sky-100 bg-white text-slate-600">
      <div className="bg-sky-600 text-white">
        <div className="container-custom py-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {benefits.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white/14 text-cyan-100">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-black leading-tight">{title}</p>
                  <p className="text-xs text-sky-50/85">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-flex rounded-2xl bg-sky-50 px-3 py-2 ring-1 ring-sky-100 transition hover:bg-white">
              <BrandLogo />
            </Link>
            <p className="mb-4 text-sm leading-relaxed">
              Mua bán, lắp đặt, bảo trì, sửa chữa và vệ sinh máy lạnh, tủ lạnh, máy giặt, máy nước nóng.
              Có thu máy cũ hoặc đổi máy bù tiền.
            </p>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {applianceBrands.slice(0, 6).map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/san-pham?brand=${brand.slug}`}
                  aria-label={`Xem sản phẩm ${brand.name}`}
                  className="flex h-9 items-center justify-center rounded-xl border border-sky-50 bg-sky-50/70 px-2 transition hover:border-sky-200 hover:bg-white"
                >
                  <ApplianceBrandLogo brand={brand.name} imageClassName="max-h-4 max-w-[4.5rem]" sizes="72px" />
                </Link>
              ))}
            </div>
            <div className="space-y-2.5 text-sm">
              <a href={phoneHref} className="flex items-center gap-2 font-bold text-slate-800 transition hover:text-sky-700">
                <Phone size={14} className="text-sky-600" />
                {phoneDisplay}
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-sky-600" />
                <span>{address}</span>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <a href={facebookHref} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1877f2] text-white transition hover:scale-105">
                <Share2 size={16} />
              </a>
              <a href={zaloHref} target="_blank" rel="noopener noreferrer" aria-label="Zalo" className="flex h-9 min-w-16 items-center justify-center rounded-2xl bg-cyan-600 px-3 text-sm font-black text-white transition hover:scale-105">
                Zalo
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-900">Danh mục điện lạnh</h3>
            <ul className="space-y-2">
              {footerCategories.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm transition hover:pl-1 hover:text-sky-700">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-900">Dịch vụ</h3>
            <ul className="space-y-2">
              {services.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm transition hover:pl-1 hover:text-sky-700">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-900">Liên hệ nhanh</h3>
            <div className="space-y-3 text-sm">
              <a href={phoneHref} className="block rounded-2xl bg-sky-50 px-4 py-3 font-bold text-sky-800 ring-1 ring-sky-100 transition hover:bg-sky-100">
                Hotline: {phoneDisplay}
              </a>
              <a href={zaloHref} target="_blank" rel="noopener noreferrer" className="block rounded-2xl bg-cyan-600 px-4 py-3 font-bold text-white transition hover:bg-cyan-700">
                Nhắn Zalo tư vấn
              </a>
              <a href={facebookHref} target="_blank" rel="noopener noreferrer" className="block rounded-2xl bg-[#1877f2] px-4 py-3 font-bold text-white transition hover:bg-[#1267d6]">
                Facebook Lưu Thảo
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900">
        <div className="container-custom flex flex-col items-center justify-between gap-2 py-4 text-xs text-sky-50/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Điện Máy Lưu Thảo - Điện lạnh uy tín tại Long Xuyên.</p>
          <p className="hidden sm:block">Có thu máy cũ hoặc đổi máy bù tiền.</p>
        </div>
      </div>
    </footer>
  );
}
