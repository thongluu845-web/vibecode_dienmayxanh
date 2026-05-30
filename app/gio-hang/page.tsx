import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Giỏ hàng của bạn",
  description: "Xem và quản lý giỏ hàng tại Điện Máy Lưu Thảo",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartView />;
}
