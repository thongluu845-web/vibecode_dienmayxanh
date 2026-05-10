import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Giỏ hàng của bạn",
  description: "Xem và quản lý giỏ hàng tại Điện Máy Xanh",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-5">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-blue-600">Trang chủ</Link></li>
          <li>/</li>
          <li className="text-gray-800 font-medium">Giỏ hàng</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingCart size={24} weight="duotone" className="text-blue-600" />
        Giỏ hàng của bạn
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Empty state */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingCart size={40} weight="duotone" className="text-blue-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-400 text-sm mb-7">Thêm sản phẩm vào giỏ hàng để tiến hành mua sắm nhé!</p>
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-2xl transition-colors shadow-md shadow-blue-200"
          >
            <ArrowLeft size={18} weight="bold" />
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
            <h3 className="font-black text-gray-800 mb-5 text-lg">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 mb-5 text-sm">
              {[
                { label: "Tạm tính",   value: "0đ",      color: "" },
                { label: "Giao hàng", value: "Miễn phí", color: "text-green-600" },
                { label: "Giảm giá",  value: "-0đ",      color: "text-red-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-semibold ${color}`}>{value}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-black text-gray-800">Tổng cộng</span>
                <span className="font-black text-red-600 text-xl">0đ</span>
              </div>
            </div>

            <button disabled className="w-full bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl mb-4 transition-colors">
              Đặt hàng ngay
            </button>

            <div className="space-y-2">
              {[
                { Icon: ShieldCheck, text: "Thanh toán an toàn & bảo mật" },
                { Icon: Truck,       text: "Giao hàng nhanh 2-4 giờ"       },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                  <Icon size={15} weight="duotone" className="text-blue-500 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
