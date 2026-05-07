import Link from "next/link";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";
import { MdLocalShipping, MdSecurity, MdLoop, MdCreditCard } from "react-icons/md";

const footerCategories = [
  { name: "Điện thoại",    href: "/danh-muc/dien-thoai" },
  { name: "Laptop",        href: "/danh-muc/laptop" },
  { name: "Tivi",          href: "/danh-muc/tivi" },
  { name: "Tủ lạnh",       href: "/danh-muc/tu-lanh" },
  { name: "Máy giặt",      href: "/danh-muc/may-giat" },
  { name: "Điều hòa",      href: "/danh-muc/dieu-hoa" },
  { name: "Máy tính bảng", href: "/danh-muc/may-tinh-bang" },
  { name: "Âm thanh",      href: "/danh-muc/am-thanh" },
];

const policies = [
  { name: "Chính sách đổi trả",  href: "/chinh-sach-doi-tra" },
  { name: "Chính sách bảo hành", href: "/chinh-sach-bao-hanh" },
  { name: "Chính sách giao hàng",href: "/chinh-sach-giao-hang" },
  { name: "Chính sách bảo mật",  href: "/chinh-sach-bao-mat" },
  { name: "Điều khoản sử dụng",  href: "/dieu-khoan-su-dung" },
];

const supports = [
  { name: "Hướng dẫn mua hàng", href: "/huong-dan-mua-hang" },
  { name: "Tra cứu đơn hàng",   href: "/tra-cuu-don-hang" },
  { name: "Tra cứu bảo hành",   href: "/tra-cuu-bao-hanh" },
  { name: "Hệ thống cửa hàng",  href: "/he-thong-cua-hang" },
  { name: "Trả góp 0%",         href: "/tra-gop" },
];

const benefits = [
  { icon: MdLocalShipping, title: "Giao hàng nhanh",  desc: "Nội thành 2-4 giờ",      color: "text-blue-400" },
  { icon: MdSecurity,      title: "Hàng chính hãng",  desc: "100% chính hãng",         color: "text-green-400" },
  { icon: MdLoop,          title: "Đổi trả 15 ngày",  desc: "Nếu lỗi sản phẩm",        color: "text-orange-400" },
  { icon: MdCreditCard,    title: "Trả góp 0%",        desc: "Duyệt nhanh 5 phút",      color: "text-yellow-400" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-8">
      {/* Benefits bar */}
      <div className="bg-[#0047a3] border-t border-blue-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className={color} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{title}</p>
                  <p className="text-blue-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand col */}
          <div>
            <div className="bg-white rounded-xl px-3 py-2 inline-flex flex-col items-center mb-4 shadow">
              <div className="flex gap-0.5">
                <span className="text-[#0055b3] font-black text-lg">ĐIỆN</span>
                <span className="text-[#ff6600] font-black text-lg">MÁY</span>
              </div>
              <span className="text-[#0055b3] font-black text-lg -mt-1">XANH</span>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Hệ thống siêu thị điện máy hàng đầu Việt Nam với hơn 2.000 cửa hàng toàn quốc.
            </p>
            <div className="space-y-2.5 text-sm">
              <a href="tel:18006789" className="flex items-center gap-2 hover:text-white transition-colors">
                <FiPhone size={14} className="text-blue-400 flex-shrink-0" />
                <span>1800 6789 <span className="text-gray-500">(miễn phí)</span></span>
              </a>
              <a href="mailto:cskh@dienmayxanh.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <FiMail size={14} className="text-blue-400 flex-shrink-0" />
                <span>cskh@dienmayxanh.com</span>
              </a>
              <div className="flex items-start gap-2">
                <FiMapPin size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span>222 Điện Biên Phủ, P.7, Q.3, TP.HCM</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-2 mt-5">
              {[
                { href: "#", icon: FaFacebookF,  bg: "hover:bg-[#1877f2]", label: "Facebook" },
                { href: "#", icon: FaYoutube,    bg: "hover:bg-[#ff0000]", label: "YouTube"  },
                { href: "#", icon: FaTiktok,     bg: "hover:bg-gray-600",  label: "TikTok"   },
              ].map(({ href, icon: Icon, bg, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 bg-gray-700 ${bg} rounded-xl flex items-center justify-center text-white transition-colors`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Danh mục</h3>
            <ul className="space-y-2">
              {footerCategories.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-white hover:pl-1 transition-all">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Chính sách</h3>
            <ul className="space-y-2">
              {policies.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-white hover:pl-1 transition-all">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + App */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Hỗ trợ</h3>
            <ul className="space-y-2 mb-6">
              {supports.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-white hover:pl-1 transition-all">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-white text-sm font-bold mb-3">Tải ứng dụng</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "App Store", emoji: "🍎" },
                { label: "Google Play", emoji: "🤖" },
              ].map(({ label, emoji }) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center gap-2.5 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3.5 py-2.5 rounded-xl transition-colors"
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="font-medium">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Điện Máy Xanh – Công ty CP Thế Giới Di Động. GPDKKD: 0303217354</p>
          <p className="hidden sm:block">Địa chỉ: 222 Điện Biên Phủ, P.7, Q.3, TP.HCM</p>
        </div>
      </div>
    </footer>
  );
}
